import { createJiti } from 'jiti'
import { consola } from 'consola'
import { Schema } from '@sanity/schema'
import { builtinTypes, extractSchema } from '@sanity/schema/_internal'
import type { SanityStudioWorkspace } from './studio-config'
import { formatWorkspaceNames, loadStudioConfig, selectStudioWorkspace } from './studio-config'

type ExtractedSchema = ReturnType<typeof extractSchema>

type SchemaTypesModule = Record<string, unknown> & { default?: unknown }

type SanityModule = {
  resolveSchemaTypes: (options: {
    config: SanityStudioWorkspace
    context: { projectId?: string, dataset?: string }
  }) => unknown
}

const logger = consola.withTag('@nuxtjs/sanity')

/** Thrown when the Sanity config declares workspaces we cannot choose between. Never recoverable by falling back. */
class WorkspaceSelectionError extends Error {}

export interface ExtractSchemaFromTypesOptions {
  /** Path to a module exporting an array of schema types. Used when no Sanity config is available. */
  typesPath?: string
  exportName?: string
  /** Path to a Sanity config file, whose schema types and plugins are the source of truth when present. */
  configPath?: string
  dataset?: string
  projectId?: string
  workspace?: string
}

export async function extractSchemaFromTypesFile(
  options: ExtractSchemaFromTypesOptions,
): Promise<ExtractedSchema> {
  const schemaTypes = await resolveSchemaTypes(options)

  const builtinSchema = Schema.compile({
    name: 'studio',
    types: builtinTypes,
  })

  const compiledSchema = Schema.compile({
    name: 'default',
    types: schemaTypes,
    parent: builtinSchema,
  })

  return extractSchema(compiledSchema, { enforceRequiredFields: true })
}

async function resolveSchemaTypes(options: ExtractSchemaFromTypesOptions): Promise<unknown[]> {
  const { configPath, typesPath, exportName } = options

  if (configPath) {
    try {
      return await resolveSchemaTypesFromConfig(configPath, options)
    }
    catch (error) {
      if (error instanceof WorkspaceSelectionError || !typesPath) {
        throw error
      }
      const message = error instanceof Error ? error.message : String(error)
      logger.warn(`Could not resolve schema types from ${configPath}, falling back to ${typesPath}: ${message}`)
    }
  }

  if (!typesPath) {
    throw new Error('Could not extract a Sanity schema. Provide either a Sanity config file or `schemaTypesPath`.')
  }

  return readSchemaTypesFromModule(typesPath, exportName)
}

async function resolveSchemaTypesFromConfig(
  configPath: string,
  options: ExtractSchemaFromTypesOptions,
): Promise<unknown[]> {
  const config = await loadStudioConfig(configPath)

  if (!config) {
    throw new Error(`Could not import Sanity config at ${configPath}`)
  }

  const { jiti, workspaces } = config
  const workspace = selectStudioWorkspace(workspaces, {
    name: options.workspace,
    projectId: options.projectId,
    dataset: options.dataset,
  })

  if (!workspace) {
    throw new WorkspaceSelectionError(
      `Could not resolve a Sanity workspace in ${configPath}. Set \`typegen.workspace\` to one of: ${formatWorkspaceNames(workspaces)}.`,
    )
  }

  const sanity = await jiti.import<SanityModule>('sanity')
  if (typeof sanity?.resolveSchemaTypes !== 'function') {
    throw new TypeError(`The Sanity package used by ${configPath} does not export resolveSchemaTypes`)
  }

  const schemaTypes = sanity.resolveSchemaTypes({
    config: workspace,
    context: {
      projectId: options.projectId || workspace.projectId,
      dataset: options.dataset || workspace.dataset,
    },
  })

  if (!Array.isArray(schemaTypes)) {
    throw new TypeError(`Could not resolve schema types from Sanity config at ${configPath}`)
  }

  return schemaTypes
}

async function readSchemaTypesFromModule(
  typesPath: string,
  exportName?: string,
): Promise<unknown[]> {
  const jiti = createJiti(typesPath, { jsx: true, interopDefault: true })
  const mod = await jiti.import<SchemaTypesModule>(typesPath, { try: true })

  if (!mod) {
    throw new Error(`Could not import schema types module at ${typesPath}`)
  }

  const schemaTypes = readSchemaTypesExport(mod, exportName)
  if (!Array.isArray(schemaTypes)) {
    throw new TypeError(
      `Could not resolve schema types from ${typesPath}. Expected an array export (default or named export).`,
    )
  }

  return schemaTypes
}

function readSchemaTypesExport(mod: SchemaTypesModule, exportName?: string): unknown {
  if (exportName) {
    return mod[exportName]
  }

  if (Array.isArray(mod.schemaTypes)) {
    return mod.schemaTypes
  }

  return mod.default
}
