/**
 * Typed client for the Rukh API (../rukh).
 * Base URL comes from NEXT_PUBLIC_RUKH_API_URL, defaulting to the local dev server.
 */

const API_URL = process.env.NEXT_PUBLIC_RUKH_API_URL || 'http://localhost:3000'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, init)
  } catch {
    throw new ApiError(0, 'Could not reach the Rukh API. Is it running?')
  }

  if (!res.ok) {
    let message = res.statusText
    try {
      const body = await res.json()
      if (Array.isArray(body?.message)) message = body.message.join(', ')
      else if (typeof body?.message === 'string') message = body.message
    } catch {
      // response had no JSON body; keep statusText
    }
    throw new ApiError(res.status, message)
  }

  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

// ---------------------------------------------------------------------------
// Ask
// ---------------------------------------------------------------------------

export type RukhModel = 'mistral' | 'anthropic' | 'openai'

export interface AskParams {
  message: string
  model?: RukhModel
  context?: string
  sessionId?: string
}

export interface UsageDto {
  input_tokens: number
  output_tokens: number
}

export interface CostDto {
  input_cost: number
  output_cost: number
  total_cost: number
}

export interface RagMetadataDto {
  selectedFiles: string[]
  totalFilesAvailable: number
  selectionMethod: string
}

export interface AskResponse {
  model: string
  output: string
  sessionId: string
  usage?: UsageDto
  cost?: CostDto
  rag?: RagMetadataDto
}

export function ask(params: AskParams): Promise<AskResponse> {
  const form = new FormData()
  form.set('message', params.message)
  if (params.model) form.set('model', params.model)
  if (params.context) form.set('context', params.context)
  if (params.sessionId) form.set('sessionId', params.sessionId)
  return request('/ask', { method: 'POST', body: form })
}

// ---------------------------------------------------------------------------
// Contexts
// ---------------------------------------------------------------------------

export interface ContextSummary {
  name: string
  description: string
}

export interface RemoteContextFile {
  name: string
  description: string
  /** Size in KB. */
  size: number
}

export interface RemoteContextLink {
  title: string
  url: string
  description?: string
  timestamp: string
}

export function listContexts(): Promise<ContextSummary[]> {
  return request('/context')
}

export function createContext(input: {
  name: string
  password: string
  description?: string
}): Promise<{ message: string; path: string }> {
  return request('/context', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export function deleteContext(name: string, password: string): Promise<{ message: string }> {
  return request(`/context/${encodeURIComponent(name)}`, {
    method: 'DELETE',
    headers: { 'x-context-password': password },
  })
}

export function listContextFiles(name: string, password: string): Promise<RemoteContextFile[]> {
  return request(`/context/${encodeURIComponent(name)}/files`, {
    headers: { 'x-context-password': password },
  })
}

export function getFileContent(name: string, filename: string, password: string): Promise<string> {
  return request(`/context/${encodeURIComponent(name)}/file/${encodeURIComponent(filename)}`, {
    headers: { 'x-context-password': password },
  })
}

export function uploadFile(input: {
  contextName: string
  filename: string
  content: string
  description?: string
  password: string
}): Promise<{ message: string; path: string; wasOverwritten: boolean }> {
  const form = new FormData()
  form.set('contextName', input.contextName)
  if (input.description) form.set('fileDescription', input.description)
  form.set('file', new Blob([input.content], { type: 'text/markdown' }), input.filename)
  return request('/context/upload', {
    method: 'POST',
    headers: { 'x-context-password': input.password },
    body: form,
  })
}

export function deleteFile(
  name: string,
  filename: string,
  password: string
): Promise<{ message: string }> {
  return request(`/context/${encodeURIComponent(name)}/file`, {
    method: 'DELETE',
    headers: { 'x-context-password': password, 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename }),
  })
}

export function listLinks(name: string, password: string): Promise<RemoteContextLink[]> {
  return request(`/context/${encodeURIComponent(name)}/links`, {
    headers: { 'x-context-password': password },
  })
}

export function addLink(
  name: string,
  link: { title: string; url: string; description?: string },
  password: string
): Promise<{ success: boolean; link: RemoteContextLink }> {
  return request(`/context/${encodeURIComponent(name)}/link`, {
    method: 'POST',
    headers: { 'x-context-password': password, 'Content-Type': 'application/json' },
    body: JSON.stringify(link),
  })
}

export function deleteLink(
  name: string,
  url: string,
  password: string
): Promise<{ success: boolean; message: string }> {
  return request(`/context/${encodeURIComponent(name)}/link`, {
    method: 'DELETE',
    headers: { 'x-context-password': password, 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })
}
