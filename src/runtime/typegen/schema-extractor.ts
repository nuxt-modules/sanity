import { createJiti } from 'jiti'
import { Schema } from '@sanity/schema'
import { builtinTypes, extractSchema } from '@sanity/schema/_internal'

type ExtractedSchema = ReturnType<typeof extractSchema>

type SchemaTypesModule = Record<string, unknown> & { default?: unknown }
type SanityConfig = {
  dataset?: string
  name?: string
  schema?: Record<string, unknown>
  projectId?: string
}

type SanityModule = {
  resolveSchemaTypes: (options: {
    config: SanityConfig
    context: {
      dataset?: string
      projectId?: string
    }
  }) => unknown
}

export interface ExtractSchemaFromTypesOptions {
  typesPath: string
  exportName?: string
  configPath?: string
  dataset?: string
  projectId?: string
  workspace?: string
}

export async function extractSchemaFromTypesFile(
  options: ExtractSchemaFromTypesOptions,
): Promise<ExtractedSchema> {
  const { typesPath, exportName, configPath } = options

  const schemaTypes = await resolveSchemaTypesFromModule(typesPath, exportName)
  const resolvedSchemaTypes = configPath
    ? await resolveSchemaTypesFromConfig(configPath, options, schemaTypes)
    : schemaTypes

  const builtinSchema = Schema.compile({
    name: 'studio',
    types: builtinTypes,
  })

  const compiledSchema = Schema.compile({
    name: 'default',
    types: resolvedSchemaTypes,
    parent: builtinSchema,
  })

  return extractSchema(compiledSchema, { enforceRequiredFields: true })
}

async function resolveSchemaTypesFromModule(
  typesPath: string,
  exportName?: string,
): Promise<unknown[]> {
  const jiti = createJiti(typesPath, { jsx: true, interopDefault: true })
  const mod = await jiti.import<SchemaTypesModule>(typesPath, { try: true })

  if (!mod) {
    throw new Error(`Could not import schema types module at ${typesPath}`)
  }

  const schemaTypes = resolveSchemaTypes(mod, exportName)
  if (!Array.isArray(schemaTypes)) {
    throw new TypeError(
      `Could not resolve schema types from ${typesPath}. Expected an array export (default or named export).`,
    )
  }

  return schemaTypes
}

async function resolveSchemaTypesFromConfig(
  configPath: string,
  options: ExtractSchemaFromTypesOptions,
  schemaTypes: unknown[],
): Promise<unknown[]> {
  const jiti = createJiti(configPath, {
    jsx: true,
    interopDefault: true,
  })
  const config = await jiti.import<SanityConfig | SanityConfig[]>(configPath, {
    default: true,
    try: true,
  })

  if (!config) {
    throw new Error(`Could not import Sanity config at ${configPath}`)
  }

  const configs = Array.isArray(config) ? config : [config]
  const workspace = selectWorkspace(configs, configPath, options)
  const typegenWorkspace = {
    ...workspace,
    schema: {
      ...workspace.schema,
      types: schemaTypes,
    },
  }

  const sanity = await jiti.import<SanityModule>('sanity')
  if (typeof sanity?.resolveSchemaTypes !== 'function') {
    throw new TypeError(`The Sanity package used by ${configPath} does not export resolveSchemaTypes`)
  }

  const resolvedSchemaTypes = sanity.resolveSchemaTypes({
    config: typegenWorkspace,
    context: {
      dataset: options.dataset || workspace.dataset,
      projectId: options.projectId || workspace.projectId,
    },
  })

  if (!Array.isArray(resolvedSchemaTypes)) {
    throw new TypeError(`Could not resolve schema types from Sanity config at ${configPath}`)
  }

  return resolvedSchemaTypes
}

function selectWorkspace(
  configs: SanityConfig[],
  configPath: string,
  options: ExtractSchemaFromTypesOptions,
): SanityConfig {
  if (options.workspace) {
    const workspace = configs.find(config => config.name === options.workspace)
    if (!workspace) {
      throw new Error(
        `Could not find Sanity workspace "${options.workspace}" in ${configPath}. Available workspaces: ${formatWorkspaceNames(configs)}.`,
      )
    }
    return workspace
  }

  if (configs.length === 1 && configs[0]) {
    return configs[0]
  }

  const matchingWorkspaces = configs.filter(config => (
    (!options.projectId || config.projectId === options.projectId)
    && (!options.dataset || config.dataset === options.dataset)
  ))

  if (matchingWorkspaces.length === 1 && matchingWorkspaces[0]) {
    return matchingWorkspaces[0]
  }

  throw new Error(
    `Could not select a unique Sanity workspace from ${configPath}. Set typegen.workspace to one of: ${formatWorkspaceNames(configs)}.`,
  )
}

function formatWorkspaceNames(configs: SanityConfig[]): string {
  return configs.map(config => config.name || 'default').join(', ')
}

function resolveSchemaTypes(mod: SchemaTypesModule, exportName?: string): unknown {
  if (exportName) {
    return mod[exportName]
  }

  if (Array.isArray(mod.schemaTypes)) {
    return mod.schemaTypes
  }

  return mod.default
}
