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

/** Turns a failed response into the message the API put in its JSON body. */
async function errorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json()
    if (Array.isArray(body?.message)) return body.message.join(', ')
    if (typeof body?.message === 'string') return body.message
  } catch {
    // response had no JSON body; keep statusText
  }
  return res.statusText
}

async function send(path: string, init?: RequestInit): Promise<Response> {
  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, init)
  } catch {
    throw new ApiError(0, 'Could not reach the Rukh API. Is it running?')
  }

  if (!res.ok) throw new ApiError(res.status, await errorMessage(res))
  return res
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await send(path, init)
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

async function requestText(path: string, init?: RequestInit): Promise<string> {
  const res = await send(path, init)
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

function askForm(params: AskParams): FormData {
  const form = new FormData()
  form.set('message', params.message)
  if (params.model) form.set('model', params.model)
  if (params.context) form.set('context', params.context)
  if (params.sessionId) form.set('sessionId', params.sessionId)
  return form
}

export function ask(params: AskParams): Promise<AskResponse> {
  return request('/ask', { method: 'POST', body: askForm(params) })
}

export interface AskStreamHandlers {
  /** A piece of the answer, to append to what has been rendered so far. */
  onChunk?: (text: string) => void
  /**
   * Discard everything rendered so far and start again. Only the
   * anthropic-web-search model emits this, when it narrates before searching
   * and then starts the real answer.
   */
  onReset?: () => void
  signal?: AbortSignal
}

/**
 * Same call as `ask()`, but with `stream=true`, so the answer arrives as
 * server-sent events. Resolves with the terminal `done` payload, which is
 * identical to what `ask()` would have returned — a caller that does not want
 * incremental rendering can simply omit the handlers.
 */
export async function askStream(
  params: AskParams,
  handlers: AskStreamHandlers = {}
): Promise<AskResponse> {
  const form = askForm(params)
  form.set('stream', 'true')

  const res = await send('/ask', { method: 'POST', body: form, signal: handlers.signal })

  // An older API that doesn't know about `stream` just answers with JSON;
  // that is still a perfectly good answer, so take it.
  if (!res.body || !res.headers.get('content-type')?.includes('text/event-stream')) {
    return (await res.json()) as AskResponse
  }

  let done: AskResponse | undefined

  for await (const frame of readSseFrames(res.body)) {
    switch (frame.event) {
      case 'chunk':
        handlers.onChunk?.(parseFrame<{ text: string }>(frame.data).text)
        break
      case 'reset':
        handlers.onReset?.()
        break
      case 'done':
        done = parseFrame<AskResponse>(frame.data)
        break
      case 'error':
        throw new ApiError(
          502,
          parseFrame<{ message: string }>(frame.data).message || 'The model failed to answer.'
        )
    }
  }

  if (!done) throw new ApiError(0, 'The answer was cut off before it was complete.')
  return done
}

function parseFrame<T>(data: string): T {
  try {
    return JSON.parse(data) as T
  } catch {
    throw new ApiError(0, 'The API sent a malformed event.')
  }
}

/**
 * Yields one server-sent event at a time from a response body. Events are
 * separated by a blank line; `event:` names the event and `data:` carries its
 * JSON payload (which never contains a raw CR, since JSON escapes it).
 */
async function* readSseFrames(
  body: ReadableStream<Uint8Array>
): AsyncGenerator<{ event: string; data: string }> {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true }).replace(/\r/g, '')

      let end = buffer.indexOf('\n\n')
      while (end !== -1) {
        const frame = parseSseFrame(buffer.slice(0, end))
        buffer = buffer.slice(end + 2)
        if (frame) yield frame
        end = buffer.indexOf('\n\n')
      }
    }
  } finally {
    // Aborts the request when the consumer stops early instead of leaving the
    // model streaming into a socket nobody reads.
    await reader.cancel().catch(() => undefined)
  }
}

function parseSseFrame(raw: string): { event: string; data: string } | null {
  let event = 'message'
  const data: string[] = []

  for (const line of raw.split('\n')) {
    if (line.startsWith('event:')) event = line.slice(6).trim()
    else if (line.startsWith('data:')) data.push(line.slice(5).trim())
  }

  return data.length ? { event, data: data.join('\n') } : null
}

// ---------------------------------------------------------------------------
// Contexts
// ---------------------------------------------------------------------------

export interface ContextSummary {
  name: string
  description: string
  /** Wallet address that created the context; only it may edit the context. */
  creatorAddress?: string
  creatorName?: string
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

/**
 * Models a context can be pinned to. Mirrors CONTEXT_MODELS in the Rukh API
 * (`src/dto/context.dto.ts`); it is a superset of `RukhModel`, since a context
 * can also force the web-search variant.
 */
export type ContextModel = 'mistral' | 'anthropic' | 'openai' | 'anthropic-web-search'

export async function createContext(
  input: {
    name: string
    creatorName?: string
    description?: string
    /** Forces this model on every /ask against the context, overriding the request's own. */
    model?: ContextModel
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
