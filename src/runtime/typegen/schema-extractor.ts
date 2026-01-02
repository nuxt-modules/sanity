import { createJiti } from 'jiti'
import { Schema } from '@sanity/schema'
import { builtinTypes, extractSchema } from '@sanity/schema/_internal'

type ExtractedSchema = ReturnType<typeof extractSchema>

type SchemaTypesModule = Record<string, unknown> & { default?: unknown }

export interface ExtractSchemaFromTypesOptions {
  typesPath: string
  exportName?: string
}

export async function extractSchemaFromTypesFile(
  options: ExtractSchemaFromTypesOptions,
): Promise<ExtractedSchema> {
  const { typesPath, exportName } = options

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

function resolveSchemaTypes(mod: SchemaTypesModule, exportName?: string): unknown {
  if (exportName) {
    return mod[exportName]
  }

  if (Array.isArray(mod.schemaTypes)) {
    return mod.schemaTypes
  }

  return mod.default
}

export async function writeSchemaJson(
  schemaPath: string,
  schema: ExtractedSchema,
): Promise<void> {
  const { writeFile, mkdir } = await import('node:fs/promises')
  const { dirname } = await import('pathe')

  await mkdir(dirname(schemaPath), { recursive: true })
  await writeFile(schemaPath, JSON.stringify(schema, null, 2), 'utf-8')
}
