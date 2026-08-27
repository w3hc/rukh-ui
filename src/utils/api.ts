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

async function requestText(path: string, init?: RequestInit): Promise<string> {
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

  return res.text()
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

/**
 * Matches useW3PK().signSiwe(): signs a SIWE message authorizing one exact
 * request. Every context-mutating/reading call below takes this instead of
 * a precomputed signature so the path it signs can never drift from the
 * path it actually requests.
 */
export type SignSiwe = (
  method: string,
  path: string
) => Promise<{ message: string; signature: string; address: string }>

interface SiweAuth {
  message: string
  signature: string
}

function siweHeaders(siwe: SiweAuth): Record<string, string> {
  // HTTP header values can't contain raw newlines, and a SIWE message is
  // multi-line, so it travels percent-encoded (the guard decodes it back).
  return {
    'x-siwe-message': encodeURIComponent(siwe.message),
    'x-siwe-signature': siwe.signature,
  }
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

export async function createContext(
  input: {
    name: string
    creatorName?: string
    description?: string
  },
  signSiwe: SignSiwe
): Promise<{ message: string; path: string }> {
  const path = '/context'
  const siwe = await signSiwe('POST', path)
  return request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...siweHeaders(siwe) },
    body: JSON.stringify({ ...input, creatorAddress: siwe.address }),
  })
}

export async function deleteContext(
  name: string,
  signSiwe: SignSiwe
): Promise<{ message: string }> {
  const path = `/context/${encodeURIComponent(name)}`
  const siwe = await signSiwe('DELETE', path)
  return request(path, { method: 'DELETE', headers: siweHeaders(siwe) })
}

export async function listContextFiles(
  name: string,
  signSiwe: SignSiwe
): Promise<RemoteContextFile[]> {
  const path = `/context/${encodeURIComponent(name)}/files`
  const siwe = await signSiwe('GET', path)
  return request(path, { headers: siweHeaders(siwe) })
}

export async function getFileContent(
  name: string,
  filename: string,
  signSiwe: SignSiwe
): Promise<string> {
  const path = `/context/${encodeURIComponent(name)}/file/${encodeURIComponent(filename)}`
  const siwe = await signSiwe('GET', path)
  return requestText(path, { headers: siweHeaders(siwe) })
}

export async function uploadFile(input: {
  contextName: string
  filename: string
  content: string
  description?: string
  signSiwe: SignSiwe
}): Promise<{ message: string; path: string; wasOverwritten: boolean }> {
  const path = '/context/upload'
  const siwe = await input.signSiwe('POST', path)
  const form = new FormData()
  form.set('contextName', input.contextName)
  if (input.description) form.set('fileDescription', input.description)
  form.set('file', new Blob([input.content], { type: 'text/markdown' }), input.filename)
  return request(path, {
    method: 'POST',
    headers: siweHeaders(siwe),
    body: form,
  })
}

export async function deleteFile(
  name: string,
  filename: string,
  signSiwe: SignSiwe
): Promise<{ message: string }> {
  const path = `/context/${encodeURIComponent(name)}/file`
  const siwe = await signSiwe('DELETE', path)
  return request(path, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', ...siweHeaders(siwe) },
    body: JSON.stringify({ filename }),
  })
}

export async function listLinks(name: string, signSiwe: SignSiwe): Promise<RemoteContextLink[]> {
  const path = `/context/${encodeURIComponent(name)}/links`
  const siwe = await signSiwe('GET', path)
  return request(path, { headers: siweHeaders(siwe) })
}

export async function addLink(
  name: string,
  link: { title: string; url: string; description?: string },
  signSiwe: SignSiwe
): Promise<{ success: boolean; link: RemoteContextLink }> {
  const path = `/context/${encodeURIComponent(name)}/link`
  const siwe = await signSiwe('POST', path)
  return request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...siweHeaders(siwe) },
    body: JSON.stringify(link),
  })
}

export async function deleteLink(
  name: string,
  url: string,
  signSiwe: SignSiwe
): Promise<{ success: boolean; message: string }> {
  const path = `/context/${encodeURIComponent(name)}/link`
  const siwe = await signSiwe('DELETE', path)
  return request(path, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', ...siweHeaders(siwe) },
    body: JSON.stringify({ url }),
  })
}
