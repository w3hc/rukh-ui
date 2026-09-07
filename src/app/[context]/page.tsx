'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Box, HStack, Heading, Text, VStack } from '@chakra-ui/react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { IconButton } from '@/components/ui/icon-button'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { toaster } from '@/components/ui/toaster'
import { FiPaperclip, FiX } from 'react-icons/fi'
import Link from 'next/link'
import Markdown from '@/components/Markdown'
import Spinner from '@/components/Spinner'
import { useW3PK } from '@/context/W3PK'
import { usePageHeader } from '@/context/PageHeader'
import { useStoredPreference } from '@/hooks/useStoredPreference'
import { brandColors } from '@/theme'
import {
  ACCEPTED_UPLOAD_EXTENSIONS,
  ApiError,
  ask,
  askStream,
  ContextSummary,
  listContexts,
  MAX_UPLOAD_BYTES,
  RukhModel,
} from '@/utils/api'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  isError?: boolean
  /** What was sent alongside the message; its content is deliberately not kept. */
  attachment?: { name: string; size: number }
}

const MODELS: { value: RukhModel; label: string }[] = [
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'mistral', label: 'Mistral' },
  { value: 'openai', label: 'OpenAI' },
]

// The composer's two settings are remembered across visits, the way the
// language selection is (`src/context/LanguageContext.tsx`). They live in
// `localStorage` rather than in `useState`, so nothing has to be copied from
// one to the other on mount.
const MODEL_STORAGE_KEY = 'preferredModel'
const STREAM_STORAGE_KEY = 'streamEnabled'

const isRukhModel = (value: string): value is RukhModel => MODELS.some(m => m.value === value)

const ACCEPTED_UPLOADS = ACCEPTED_UPLOAD_EXTENSIONS.join(', ')

/**
 * Mirrors the API's `FileValidator`, so a file it would reject never costs a
 * round trip. Returns the message to show, or null when the file is fine.
 */
function uploadError(file: File): string | null {
  const name = file.name.toLowerCase()
  if (!ACCEPTED_UPLOAD_EXTENSIONS.some(ext => name.endsWith(ext))) {
    return `Only ${ACCEPTED_UPLOADS} files can be attached.`
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return `That file is over the ${MAX_UPLOAD_BYTES / 1024 / 1024} MB limit.`
  }
  return null
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export default function ContextPage() {
  const params = useParams<{ context: string }>()
  const contextName = params.context
  const { isAuthenticated, getAddress } = useW3PK()

  const [context, setContext] = useState<ContextSummary | null | undefined>(undefined) // undefined = loading
  const [address, setAddress] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  // The answer as it arrives, rendered in place of the "thinking" spinner.
  // null when nothing is streaming.
  const [streamingText, setStreamingText] = useState<string | null>(null)
  // The model's reasoning, shown while it works and dropped the moment the
  // answer starts. It is not part of the answer and is never kept.
  const [thinkingText, setThinkingText] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | undefined>(undefined)
  const [isSending, setIsSending] = useState(false)
  // Goes with the next message and is cleared once it is sent: the API puts it
  // in the system prompt for that one call, so a chip that lingered would imply
  // a persistence that does not exist.
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Both fall back to their defaults until the stored value is read, which is
  // after hydration.
  const [storedModel, setStoredModel] = useStoredPreference(MODEL_STORAGE_KEY)
  const model: RukhModel = storedModel && isRukhModel(storedModel) ? storedModel : 'anthropic'
  const [storedStream, setStoredStream] = useStoredPreference(STREAM_STORAGE_KEY)
  const stream = storedStream === null ? true : storedStream === 'true'

  useEffect(() => {
    let cancelled = false
    listContexts()
      .then(all => {
        if (cancelled) return
        setContext(all.find(c => c.name === contextName) ?? null)
      })
      .catch(() => {
        if (!cancelled) setContext(null)
      })
    return () => {
      cancelled = true
    }
  }, [contextName])

  // The address that signs API calls — the one a context records as its
  // creator — is the derived wallet, not `user.ethereumAddress`.
  useEffect(() => {
    if (!isAuthenticated) return
    let cancelled = false
    getAddress()
      .then(a => {
        if (!cancelled) setAddress(a)
      })
      .catch(() => {
        // Not being able to resolve the address just means no edit menu item.
      })
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, getAddress])

  // `address` is kept even after a logout, so authentication is checked here
  // rather than cleared there.
  const isCreator = Boolean(
    isAuthenticated &&
    context?.creatorAddress &&
    address &&
    context.creatorAddress.toLowerCase() === address.toLowerCase()
  )

  // The header carries the title ("Rukh / <context>") and the edit entry, so
  // the page below is nothing but the conversation.
  usePageHeader(context ? context.name : null, isCreator)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText, thinkingText])

  /** Takes a file if the API would, and says why in a toast if it would not. */
  const attach = useCallback((candidate: File) => {
    const error = uploadError(candidate)
    if (error) {
      toaster.create({ title: error, type: 'error', duration: 4000 })
      return
    }
    // One at a time, matching the server, which takes a single part.
    setFile(candidate)
  }, [])

  // The drag target is the window rather than the composer: a zone the user has
  // to aim at is a worse target than the whole page, and listening here also
  // stops the browser from navigating away to a file dropped anywhere else.
  //
  // `dragleave` fires on every element boundary crossed on the way in, so the
  // depth counter is what separates leaving a child from leaving the page.
  useEffect(() => {
    let depth = 0

    const onDragEnter = (e: DragEvent) => {
      if (!e.dataTransfer?.types.includes('Files')) return
      e.preventDefault()
      depth += 1
      setIsDragging(true)
    }
    const onDragOver = (e: DragEvent) => {
      if (!e.dataTransfer?.types.includes('Files')) return
      e.preventDefault()
    }
    const onDragLeave = () => {
      depth = Math.max(0, depth - 1)
      if (depth === 0) setIsDragging(false)
    }
    const onDrop = (e: DragEvent) => {
      depth = 0
      setIsDragging(false)
      const dropped = e.dataTransfer?.files?.[0]
      if (!dropped) return
      // Without this the browser leaves the conversation to open the file.
      e.preventDefault()
      attach(dropped)
    }

    window.addEventListener('dragenter', onDragEnter)
    window.addEventListener('dragover', onDragOver)
    window.addEventListener('dragleave', onDragLeave)
    window.addEventListener('drop', onDrop)
    return () => {
      window.removeEventListener('dragenter', onDragEnter)
      window.removeEventListener('dragover', onDragOver)
      window.removeEventListener('dragleave', onDragLeave)
      window.removeEventListener('drop', onDrop)
    }
  }, [attach])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // A file on its own is a valid message. `AskDto.message` is not nullable,
    // so an empty composer sends the filename — enough for the model to know
    // what arrived, and it reads sensibly in the transcript.
    const message = input.trim() || file?.name || ''
    if (!message || isSending) return
    const attachment = file ? { name: file.name, size: file.size } : undefined
    setMessages(prev => [...prev, { role: 'user', content: message, attachment }])
    setInput('')
    setIsSending(true)
    if (stream) setStreamingText('')
    setThinkingText(null)
    const params = { message, model, context: contextName, sessionId, file: file ?? undefined }
    setFile(null)
    try {
      // Both paths end on the same payload: streaming only changes how much of
      // the answer is on screen before it lands.
      const response = stream
        ? await askStream(params, {
            onChunk: text => {
              // Reasoning has served its purpose once the answer begins
              setThinkingText(null)
              setStreamingText(prev => (prev ?? '') + text)
            },
            onThinking: text => setThinkingText(prev => (prev ?? '') + text),
            // The model narrated before searching; what it said is not part of
            // the answer, so drop it.
            onReset: () => setStreamingText(''),
          })
        : await ask(params)
      setSessionId(response.sessionId)
      setMessages(prev => [...prev, { role: 'assistant', content: response.output }])
    } catch (err) {
      const description = err instanceof ApiError ? err.message : 'Something went wrong.'
      setMessages(prev => [...prev, { role: 'assistant', content: description, isError: true }])
    } finally {
      setStreamingText(null)
      setThinkingText(null)
      setIsSending(false)
    }
  }

  // Enter sends, Shift+Enter adds a line. A textarea would otherwise swallow
  // Enter, leaving the Send button as the only way to submit.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Enter' || e.shiftKey) return
    // Mid-composition Enter commits an IME candidate; it is not a submit.
    if (e.nativeEvent.isComposing) return
    e.preventDefault()
    void handleSubmit(e)
  }

  if (context === undefined) {
    return (
      <Box textAlign="center" py={20}>
        <Spinner size="200px" />
      </Box>
    )
  }

  if (context === null) {
    return (
      <VStack gap={4} py={20} textAlign="center">
        <Heading as="h1" size="lg">
          Context not found
        </Heading>
        <Text color="gray.400">No context named &ldquo;{contextName}&rdquo; is available.</Text>
        <Link href="/">
          <Button variant="outline" size="sm">
            Back to all contexts
          </Button>
        </Link>
      </VStack>
    )
  }

  return (
    <Box pb="180px">
      {isDragging && (
        <Box
          position="fixed"
          inset={0}
          zIndex="modal"
          bg="blackAlpha.800"
          display="flex"
          alignItems="center"
          justifyContent="center"
          pointerEvents="none"
        >
          <Box
            borderWidth="2px"
            borderStyle="dashed"
            borderColor={brandColors.accent}
            borderRadius="lg"
            px={10}
            py={8}
            textAlign="center"
          >
            <Text fontSize="lg" color="white">
              Drop a file to attach it
            </Text>
            <Text fontSize="sm" color="gray.400" mt={1}>
              {ACCEPTED_UPLOADS} · up to {MAX_UPLOAD_BYTES / 1024 / 1024} MB
            </Text>
          </Box>
        </Box>
      )}

      {messages.length === 0 && !isSending ? (
        <Text
          mt={8}
          color="gray.500"
          cursor="pointer"
          onClick={() => inputRef.current?.focus()}
        ></Text>
      ) : (
        <VStack gap={6} align="stretch" py={8}>
          {messages.map((message, i) =>
            message.role === 'user' ? (
              <Box key={i}>
                <Text color={brandColors.accent} whiteSpace="pre-wrap">
                  {message.content}
                </Text>
                {/* The file's text is never echoed here: a 5 MB CSV in the
                    scrollback is precisely what this feature removes. */}
                {message.attachment && (
                  <HStack gap={1.5} mt={1} color="gray.500" fontSize="xs">
                    <FiPaperclip aria-hidden />
                    <Text>
                      {message.attachment.name} · {formatSize(message.attachment.size)}
                    </Text>
                  </HStack>
                )}
              </Box>
            ) : (
              <Box key={i} color={message.isError ? 'red.300' : undefined}>
                <Markdown>{message.content}</Markdown>
              </Box>
            )
          )}
          {isSending &&
            (streamingText ? (
              <Markdown>{streamingText}</Markdown>
            ) : thinkingText ? (
              <Box
                borderLeftWidth="2px"
                borderColor="whiteAlpha.300"
                pl={4}
                color="gray.500"
                fontSize="sm"
              >
                <Text mb={1} fontSize="xs" textTransform="uppercase" letterSpacing="wide">
                  Thinking
                </Text>
                <Text whiteSpace="pre-wrap">{thinkingText}</Text>
              </Box>
            ) : (
              <Box alignSelf="flex-start">
                <Spinner />
              </Box>
            ))}
          <div ref={messagesEndRef} />
        </VStack>
      )}

      <Box position="fixed" bottom={0} left={0} right={0} py={4}>
        <Box
          as="form"
          maxW={{ base: '100%', sm: '640px', md: '768px', lg: '960px', xl: '1024px' }}
          mx="auto"
          px={{ base: 4, md: 6, lg: 8 }}
          onSubmit={handleSubmit}
        >
          {file && (
            <HStack
              gap={2}
              mb={2}
              px={3}
              py={1.5}
              w="fit-content"
              maxW="100%"
              borderWidth="1px"
              borderColor="whiteAlpha.300"
              borderRadius="md"
            >
              <Box color="gray.400" flexShrink={0}>
                <FiPaperclip aria-hidden />
              </Box>
              <Text fontSize="sm" color="gray.300" truncate>
                {file.name}
              </Text>
              <Text fontSize="xs" color="gray.500" flexShrink={0}>
                {formatSize(file.size)}
              </Text>
              <IconButton
                aria-label={`Remove ${file.name}`}
                size="2xs"
                variant="ghost"
                color="gray.400"
                _hover={{ color: 'white', bg: 'whiteAlpha.200' }}
                onClick={() => setFile(null)}
              >
                <FiX />
              </IconButton>
            </HStack>
          )}
          <HStack gap={2} align="flex-end">
            <Textarea
              ref={inputRef}
              aria-label={`Message the ${context.name} context`}
              placeholder={`Message ${context.name}...`}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSending}
              size="lg"
              flex="1"
              bg="black"
              borderColor="whiteAlpha.300"
              _focus={{ borderColor: brandColors.accent, boxShadow: 'none', bg: 'black' }}
            />
            {/* Dragging is unreachable by keyboard and absent on iOS, so the
                paperclip is the way in, not a shortcut. */}
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_UPLOAD_EXTENSIONS.join(',')}
              hidden
              onChange={e => {
                const picked = e.target.files?.[0]
                if (picked) attach(picked)
                // Lets the same file be picked again after being removed.
                e.target.value = ''
              }}
            />
            <IconButton
              aria-label="Attach a file"
              variant="outline"
              size="lg"
              borderColor="whiteAlpha.300"
              color="gray.400"
              _hover={{ color: 'white', borderColor: 'whiteAlpha.500' }}
              disabled={isSending}
              onClick={() => fileInputRef.current?.click()}
            >
              <FiPaperclip />
            </IconButton>
            <Button
              type="submit"
              bg={brandColors.primary}
              color="white"
              _hover={{ bg: brandColors.secondary }}
              size="lg"
              px={6}
              disabled={(!input.trim() && !file) || isSending}
            >
              Send
            </Button>
          </HStack>
          <HStack gap={3} mt={1.5} align="center">
            <Box w="100px">
              <Select
                value={model}
                onChange={e => setStoredModel(e.target.value)}
                aria-label="Model"
                bg="transparent"
                borderColor="whiteAlpha.200"
                color="gray.500"
                fontSize="xs"
                pl={2}
                pr={5}
                py={0.5}
                h="auto"
              >
                {MODELS.map(m => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </Select>
            </Box>
            <Checkbox
              checked={stream}
              onCheckedChange={e => setStoredStream(String(!!e.checked))}
              size="xs"
              colorPalette="purple"
            >
              <Text fontSize="xs" color="gray.500">
                Stream
              </Text>
            </Checkbox>
          </HStack>
        </Box>
      </Box>
    </Box>
  )
}
