'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Box, HStack, Heading, Text, VStack } from '@chakra-ui/react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import Link from 'next/link'
import Markdown from '@/components/Markdown'
import Spinner from '@/components/Spinner'
import { useW3PK } from '@/context/W3PK'
import { usePageHeader } from '@/context/PageHeader'
import { brandColors } from '@/theme'
import { ApiError, ask, askStream, ContextSummary, listContexts, RukhModel } from '@/utils/api'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  isError?: boolean
}

const MODELS: { value: RukhModel; label: string }[] = [
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'mistral', label: 'Mistral' },
  { value: 'openai', label: 'OpenAI' },
]

export default function ContextPage() {
  const params = useParams<{ context: string }>()
  const contextName = params.context
  const { isAuthenticated, getAddress } = useW3PK()

  const [context, setContext] = useState<ContextSummary | null | undefined>(undefined) // undefined = loading
  const [address, setAddress] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [model, setModel] = useState<RukhModel>('anthropic')
  const [stream, setStream] = useState(true)
  // The answer as it arrives, rendered in place of the "thinking" spinner.
  // null when nothing is streaming.
  const [streamingText, setStreamingText] = useState<string | null>(null)
  // The model's reasoning, shown while it works and dropped the moment the
  // answer starts. It is not part of the answer and is never kept.
  const [thinkingText, setThinkingText] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | undefined>(undefined)
  const [isSending, setIsSending] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const message = input.trim()
    if (!message || isSending) return
    setMessages(prev => [...prev, { role: 'user', content: message }])
    setInput('')
    setIsSending(true)
    if (stream) setStreamingText('')
    setThinkingText(null)
    const params = { message, model, context: contextName, sessionId }
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
              <Text key={i} color={brandColors.accent} whiteSpace="pre-wrap">
                {message.content}
              </Text>
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
            <Button
              type="submit"
              bg={brandColors.primary}
              color="white"
              _hover={{ bg: brandColors.secondary }}
              size="lg"
              px={6}
              disabled={!input.trim() || isSending}
            >
              Send
            </Button>
          </HStack>
          <HStack gap={3} mt={1.5} align="center">
            <Box w="100px">
              <Select
                value={model}
                onChange={e => setModel(e.target.value as RukhModel)}
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
              onCheckedChange={e => setStream(!!e.checked)}
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
