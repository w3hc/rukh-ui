'use client'

import { useEffect, useState, useSyncExternalStore, type ReactNode } from 'react'
import { Box, Heading, Link as ChakraLink, Text, VStack } from '@chakra-ui/react'
import { IconButton } from '@/components/ui/icon-button'
import { toaster } from '@/components/ui/toaster'
import Link from 'next/link'
import { FiCheck, FiCopy } from 'react-icons/fi'
import { brandColors } from '@/theme'

// The docs describe the public API, so they fall back to the hosted instance
// rather than to `api.ts`'s localhost default.
const API_URL = process.env.NEXT_PUBLIC_RUKH_API_URL || 'https://rukh.w3hc.org'

const EXAMPLE_CONTEXT = 'rukh'
const EXAMPLE_SESSION_ID = '15a7e248-17f2-4b9e-a42b-000f97a075e7'

const firstRequest = `curl '${API_URL}/ask' \\
  -H 'Content-Type: multipart/form-data' \\
  -F 'message=What'\\''s Rukh?' \\
  -F 'context=${EXAMPLE_CONTEXT}'`

const firstResponse = `{
  "output": "**Rukh** (also spelled roc, ruḵḵ, or rokh) is an enormous legendary bird of prey from Middle Eastern mythology and folklore.",
  "model": "claude-sonnet-5",
  "sessionId": "${EXAMPLE_SESSION_ID}",
  "usage": {
    "input_tokens": 1930,
    "output_tokens": 352
  },
  "cost": {
    "input_cost": 0.005796,
    "output_cost": 0.00528,
    "total_cost": 0.011076
  },
  "rag": {
    "selectedFiles": ["rukh-definition.md"],
    "totalFilesAvailable": 1,
    "selectionMethod": "rag-two-step"
  }
}`

const followUpRequest = `curl '${API_URL}/ask' \\
  -H 'Content-Type: multipart/form-data' \\
  -F 'message=How big was it supposed to be?' \\
  -F 'context=${EXAMPLE_CONTEXT}' \\
  -F 'sessionId=${EXAMPLE_SESSION_ID}'`

const followUpResponse = `{
  "output": "Accounts describe a bird large enough to carry off an elephant — its wingspan is usually given as thirty paces.",
  "model": "claude-sonnet-5",
  "sessionId": "${EXAMPLE_SESSION_ID}"
}`

function TextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <ChakraLink asChild color={brandColors.accent} textDecoration="underline">
      <Link href={href}>{children}</Link>
    </ChakraLink>
  )
}

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  // mailto: hands off to the mail client, so a new tab would just be left blank.
  const isMailto = href.startsWith('mailto:')
  return (
    <ChakraLink
      href={href}
      color={brandColors.accent}
      textDecoration="underline"
      {...(isMailto ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
    >
      {children}
    </ChakraLink>
  )
}

function Snippet({ code, label }: { code: string; label: string }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
    } catch {
      toaster.create({ title: 'Could not copy to clipboard', type: 'error', duration: 3000 })
    }
  }

  return (
    <Box position="relative" bg="gray.900" borderRadius="md" p={4} pr={12}>
      <Box
        as="pre"
        margin={0}
        whiteSpace="pre-wrap"
        wordBreak="break-word"
        fontFamily="monospace"
        fontSize="xs"
        color="gray.200"
      >
        {code}
      </Box>
      <IconButton
        aria-label={copied ? `${label} copied` : `Copy ${label}`}
        size="xs"
        variant="ghost"
        position="absolute"
        top={2}
        right={2}
        onClick={handleCopy}
      >
        {copied ? <FiCheck /> : <FiCopy />}
      </IconButton>
    </Box>
  )
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <VStack as="section" id={id} gap={4} align="stretch" scrollMarginTop="88px">
      <Heading as="h2" size="lg">
        {title}
      </Heading>
      {children}
    </VStack>
  )
}

// The share-link example should show the host the reader is actually on; the
// origin is only known client-side, so it is read as an external store to keep
// the server render and the first client render in sync.
const subscribeToOrigin = () => () => {}
const getOrigin = () => window.location.origin
const getServerOrigin = () => 'https://rukh.it'

export default function DocsPage() {
  const origin = useSyncExternalStore(subscribeToOrigin, getOrigin, getServerOrigin)

  return (
    <VStack gap={12} align="stretch" py={12}>
      <Box>
        <Heading as="h1" size="2xl" mb={3}>
          Docs
        </Heading>
        <Text color="gray.400" fontSize="lg">
          Talk to a context, build your own, and plug it into anything.
        </Text>
      </Box>

      <Section id="interact" title="Interact with an existing context">
        <Text color="gray.300">
          A <strong>context</strong> is an AI assistant with its own knowledge: a set of documents
          and links its author has curated. Asking the same question of two contexts gives you two
          different answers, because each one reads from its own material.
        </Text>
        <Text color="gray.300">
          The <TextLink href="/">home page</TextLink> lists every context available to you. Pick one
          and you land on its conversation page — type a question, choose the model you want to
          answer with, and send. Follow-up questions stay in the same session, so the context
          remembers what you already said. No account is needed to interact with a context.
        </Text>
      </Section>

      <Section id="create" title="Become a creator">
        <Text color="gray.300">
          Anyone can publish a context of their own. In the menu at the top right, click{' '}
          <strong>Create</strong>, give your context a name and a short description, and it is live.
        </Text>
        <Text color="gray.300">
          From there, open your context&apos;s edit page to fill it in. You can upload documents
          (markdown files: notes, FAQs, product documentation, course material) and add links to
          pages you want it to read. Everything you add becomes part of what the context knows —
          upload a new version of a document and the answers change with it.
        </Text>
        <Text color="gray.300">
          Your contexts are listed on your <TextLink href="/dashboard">dashboard</TextLink>, where
          you can open, edit, or delete them. Creating and editing require a passkey login: your
          context is tied to your wallet address, and only you can change it.
        </Text>
      </Section>

      <Section id="share" title="Let others use your context">
        <Text color="gray.300">
          Once a context exists, there are two ways to put it in front of other people.
        </Text>

        <Box borderLeft="3px solid" borderColor={brandColors.primary} pl={4}>
          <Heading as="h3" size="md" mb={2}>
            1. Share the link
          </Heading>
          <Text color="gray.300" mb={3}>
            Every context has its own page. Send the URL to anyone and they can start a conversation
            right away — no install, no account, nothing to set up on their side.
          </Text>
          <Snippet code={`${origin}/${EXAMPLE_CONTEXT}`} label="context link" />
        </Box>

        <Box borderLeft="3px solid" borderColor={brandColors.primary} pl={4}>
          <Heading as="h3" size="md" mb={2}>
            2. Integrate it into your own website
          </Heading>
          <Text color="gray.300" mb={3}>
            Your context is also reachable over HTTP, so you can wire it into your own chat widget,
            support page, bot, or backend. Post to <code>/ask</code> with the name of your context:
          </Text>
          <Snippet code={firstRequest} label="request" />
          <Text color="gray.300" mt={4} mb={3}>
            The response carries the answer, the model that produced it, what it cost, and which of
            your documents were used to answer:
          </Text>
          <Snippet code={firstResponse} label="response" />
        </Box>
      </Section>

      <Section id="sessions" title="Keeping the conversation going">
        <Text color="gray.300">
          Every response includes a <code>sessionId</code>. Pass it back on the next request and the
          context picks up where it left off, with the earlier exchange still in mind:
        </Text>
        <Snippet code={followUpRequest} label="follow-up request" />
        <Text color="gray.300">
          The same <code>sessionId</code> comes back, so you can keep threading a conversation for
          as long as you need:
        </Text>
        <Snippet code={followUpResponse} label="follow-up response" />
        <Text color="gray.400" fontSize="sm">
          Store the <code>sessionId</code> per visitor — in a cookie, in <code>localStorage</code>,
          or alongside your own conversation record. Omit it and you start a fresh conversation with
          no memory of the previous one.
        </Text>
      </Section>

      <Section id="contact" title="Need a hand?">
        <Text color="gray.300">
          Whether you are stuck on your first context, wondering if Rukh fits what you have in mind,
          or you have found something that looks broken — get in touch, anytime. Ask anything.
        </Text>
        <Text color="gray.300">
          Reach Julien via the{' '}
          <ExternalLink href="https://julienberanger.com/contact">contact page</ExternalLink>, or
          send an email to{' '}
          <ExternalLink href="mailto:support@rukh.it">support@rukh.it</ExternalLink>.
        </Text>
      </Section>
    </VStack>
  )
}
