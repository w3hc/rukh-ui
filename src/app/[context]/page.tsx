'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Badge, Box, Flex, Heading, HStack, Text, Textarea, VStack } from '@chakra-ui/react'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
import Link from 'next/link'
import { FiArrowLeft, FiEdit2, FiSend } from 'react-icons/fi'
import Spinner from '@/components/Spinner'
import { brandColors } from '@/theme'
import { ApiError, ask, ContextSummary, listContexts, RukhModel } from '@/utils/api'

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

  const [context, setContext] = useState<ContextSummary | null | undefined>(undefined) // undefined = loading
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [model, setModel] = useState<RukhModel>('anthropic')
  const [sessionId, setSessionId] = useState<string | undefined>(undefined)
  const [isSending, setIsSending] = useState(false)
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const message = input.trim()
    if (!message || isSending) return
    setMessages(prev => [...prev, { role: 'user', content: message }])
    setInput('')
    setIsSending(true)
    try {
      const response = await ask({ message, model, context: contextName, sessionId })
      setSessionId(response.sessionId)
      setMessages(prev => [...prev, { role: 'assistant', content: response.output }])
    } catch (err) {
      const description = err instanceof ApiError ? err.message : 'Something went wrong.'
      setMessages(prev => [...prev, { role: 'assistant', content: description, isError: true }])
    } finally {
      setIsSending(false)
    }
  }

  if (context === undefined) {
    return (
      <Box textAlign="center" py={20}>
        <Spinner />
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
            <FiArrowLeft aria-hidden="true" /> Back to all contexts
          </Button>
        </Link>
      </VStack>
    )
  }

  return (
    <Flex direction="column" minH="calc(100vh - 72px)" py={8}>
      {/* Context header */}
      <Flex justify="space-between" align="flex-start" gap={4} flexWrap="wrap" mb={6}>
        <Box>
          <HStack gap={3} mb={1}>
            <Link href="/">
              <IconButton aria-label="Back to all contexts" variant="ghost" size="sm">
                <FiArrowLeft />
              </IconButton>
            </Link>
            <Heading as="h1" size="lg" color={brandColors.accent}>
              {context.name}
            </Heading>
          </HStack>
          <Text color="gray.400" fontSize="sm" pl={12}>
            {context.description}
          </Text>
        </Box>
        <HStack gap={3}>
          <select
            value={model}
            onChange={e => setModel(e.target.value as RukhModel)}
            aria-label="Model"
            style={{
              background: 'transparent',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '6px',
              fontSize: '0.875rem',
              padding: '4px 8px',
              color: 'inherit',
            }}
          >
            {MODELS.map(m => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <Link href={`/${context.name}/edit`}>
            <Button variant="outline" size="sm">
              <FiEdit2 aria-hidden="true" /> Edit context
            </Button>
          </Link>
        </HStack>
      </Flex>

      {/* Messages */}
      <Box flex="1" overflowY="auto" mb={4}>
        {messages.length === 0 ? (
          <VStack gap={2} py={16} textAlign="center">
            <Text color="gray.500" fontSize="lg">
              Ask anything about {context.name}
            </Text>
          </VStack>
        ) : (
          <VStack gap={4} align="stretch">
            {messages.map((message, i) => (
              <Flex key={i} justify={message.role === 'user' ? 'flex-end' : 'flex-start'}>
                <Box
                  maxW="80%"
                  px={4}
                  py={3}
                  borderRadius="lg"
                  bg={
                    message.role === 'user'
                      ? brandColors.primary
                      : message.isError
                        ? 'red.900'
                        : 'whiteAlpha.100'
                  }
                  color={message.role === 'user' ? 'white' : undefined}
                >
                  <Text fontSize="sm" whiteSpace="pre-wrap">
                    {message.content}
                  </Text>
                </Box>
              </Flex>
            ))}
            {isSending && (
              <Flex justify="flex-start">
                <Box px={4} py={3} borderRadius="lg" bg="whiteAlpha.100">
                  <Spinner size="16px" />
                </Box>
              </Flex>
            )}
            <div ref={messagesEndRef} />
          </VStack>
        )}
      </Box>

      {/* Input */}
      <HStack
        gap={2}
        p={3}
        borderWidth="1px"
        borderColor="whiteAlpha.200"
        borderRadius="lg"
        align="flex-end"
      >
        <Textarea
          aria-label={`Message the ${context.name} context`}
          placeholder={`Message ${context.name}...`}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          rows={1}
          resize="none"
          border="none"
          _focus={{ boxShadow: 'none', outline: 'none' }}
          disabled={isSending}
        />
        <IconButton
          aria-label="Send message"
          bg={brandColors.primary}
          color="white"
          _hover={{ bg: brandColors.secondary }}
          onClick={handleSend}
          disabled={!input.trim() || isSending}
        >
          <FiSend />
        </IconButton>
      </HStack>

      {sessionId && (
        <HStack justify="flex-end" pt={2}>
          <Badge variant="subtle" colorPalette="gray" fontSize="xs">
            Session {sessionId.slice(0, 8)}
          </Badge>
        </HStack>
      )}
    </Flex>
  )
}
