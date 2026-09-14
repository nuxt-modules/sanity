import { createJiti } from 'jiti'

export interface SanityStudioWorkspace {
  name?: string
  projectId?: string
  dataset?: string
  schema?: { types?: unknown[] }
}

export interface LoadedStudioConfig {
  /** Rooted at the config file so that `sanity` resolves from the studio's own dependencies. */
  jiti: ReturnType<typeof createJiti>
  workspaces: SanityStudioWorkspace[]
}

export async function loadStudioConfig(configPath: string): Promise<LoadedStudioConfig | undefined> {
  const jiti = createJiti(configPath, { jsx: true, interopDefault: true })
  const config = await jiti.import<SanityStudioWorkspace | SanityStudioWorkspace[]>(configPath, {
    default: true,
    try: true,
  })

  if (!config) {
    return
  }

  return { jiti, workspaces: [config].flat() }
}

export interface SelectStudioWorkspaceOptions {
  name?: string
  projectId?: string
  dataset?: string
}

export function selectStudioWorkspace(
  workspaces: SanityStudioWorkspace[],
  options: SelectStudioWorkspaceOptions = {},
): SanityStudioWorkspace | undefined {
  if (options.name) {
    return workspaces.find(workspace => workspace.name === options.name)
  }

  if (workspaces.length === 1) {
    return workspaces[0]
  }

  const matches = workspaces.filter(workspace => (
    workspace.projectId === options.projectId && workspace.dataset === options.dataset
  ))

  return matches.length === 1 ? matches[0] : undefined
}

export function formatWorkspaceNames(workspaces: SanityStudioWorkspace[]): string {
  return workspaces.map(workspace => workspace.name || 'default').join(', ')
}
