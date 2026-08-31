'use client'

import {
  Box,
  Flex,
  Heading,
  Icon,
  Link as ChakraLink,
  SimpleGrid,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import ContextCard from '@/components/ContextCard'
import Spinner from '@/components/Spinner'
import { ApiError, listContexts } from '@/utils/api'
import type { RukhContext } from '@/utils/contexts'
import { FiArrowRight, FiEyeOff, FiLayers, FiSliders, FiX } from 'react-icons/fi'
import type { ReactNode } from 'react'
import type { IconType } from 'react-icons'
import Snippet from '@/components/Snippet'
import { brandColors } from '@/theme'

// The homepage advertises the public API, so it falls back to the hosted
// instance rather than to `api.ts`'s localhost default — same as `/docs`.
const API_URL = process.env.NEXT_PUBLIC_RUKH_API_URL || 'https://rukh.w3hc.org'

const shareExample = 'https://rukh.it/your-context'

const integrateExample = `curl '${API_URL}/ask' \\
  -F 'message=How do I reset my password?' \\
  -F 'context=your-context'`

const notNeeded = [
  'SDK',
  'Vector database',
  'Embeddings',
  'Fine-tuning',
  'Provider keys',
  'User accounts',
  'Conversation store',
]

type Pillar = {
  icon: IconType
  eyebrow: string
  title: string
  body: string
  points: string[]
}

const pillars: Pillar[] = [
  {
    icon: FiEyeOff,
    eyebrow: 'Privacy-preserving',
    title: 'The provider never meets your users',
    body: 'There is no account to create and no key of yours in play. Every question reaches the model behind Rukh, pooled with everyone else’s — the provider sees a question, not a person.',
    points: ['No sign-up, no identity attached', 'Nothing left to build a profile from'],
  },
  {
    icon: FiSliders,
    eyebrow: 'Your call',
    title: 'Let your users choose the model',
    body: 'Claude, Mistral, OpenAI — the choice belongs to the person asking, not to the platform. And offering all three costs you nothing: Rukh holds the provider accounts, so you hold no keys at all.',
    points: ['One call, every provider', 'No provider account, no keys to rotate'],
  },
  {
    icon: FiLayers,
    eyebrow: 'No bias',
    title: 'You build your own context',
    body: 'Answers come from documents you chose and can read line by line — nothing smuggled in from upstream. Change a file and the answers change with it: no retraining, no pipeline to re-run.',
    points: ['Every answer names the files it used', 'Every answer reports what it cost'],
  },
]

function StepBadge({ children }: { children: ReactNode }) {
  return (
    <Flex
      align="center"
      justify="center"
      w={9}
      h={9}
      flexShrink={0}
      borderRadius="full"
      bg={brandColors.primary}
      color="white"
      fontSize="sm"
      fontWeight="bold"
    >
      {children}
    </Flex>
  )
}

function SectionHeading({ title, children }: { title: string; children: ReactNode }) {
  return (
    <VStack gap={5} textAlign="center" maxW="680px" mx="auto">
      <Heading as="h2" size={{ base: 'xl', md: '2xl' }} lineHeight="1.2">
        {title}
      </Heading>
      <Text color="gray.400" fontSize={{ base: 'md', md: 'lg' }} lineHeight="1.7">
        {children}
      </Text>
    </VStack>
  )
}

export default function Home() {
  const [contexts, setContexts] = useState<RukhContext[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    listContexts()
      .then(data => {
        if (cancelled) return
        setContexts([...data].sort((a, b) => a.name.localeCompare(b.name)))
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof ApiError ? err.message : 'Failed to load contexts.')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <VStack gap={{ base: 28, md: 40 }} align="stretch" pb={{ base: 24, md: 32 }}>
      <Box
        position="relative"
        mx={{ base: -4, md: -6, lg: -8 }}
        px={{ base: 6, md: 10 }}
        py={{ base: 24, md: 40 }}
        css={{
          backgroundImage:
            'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(140, 28, 132, 0.38), transparent 70%)',
        }}
      >
        <VStack gap={{ base: 8, md: 10 }} textAlign="center" maxW="840px" mx="auto">
          <Flex
            align="center"
            gap={2}
            px={4}
            py={1.5}
            borderWidth="1px"
            borderColor="whiteAlpha.300"
            borderRadius="full"
          >
            <Box as="span" w={2} h={2} borderRadius="full" bg={brandColors.accent} />
            <Text fontSize="xs" letterSpacing="wider" textTransform="uppercase" color="gray.300">
              Private by design · Open source
            </Text>
          </Flex>

          <Heading
            as="h1"
            size={{ base: '3xl', md: '6xl' }}
            lineHeight="1.05"
            letterSpacing="tight"
          >
            See the Rukh fly
          </Heading>

          <Text color="gray.300" fontSize={{ base: 'lg', md: '2xl' }} lineHeight="1.6" maxW="720px">
            An assistant that answers from{' '}
            <Box as="span" color={brandColors.accent}>
              your context
            </Box>
            , on the model{' '}
            <Box as="span" color={brandColors.accent}>
              your users pick
            </Box>{' '}
            — and never learns who is asking.
          </Text>

          <Flex gap={4} pt={2} flexWrap="wrap" justify="center">
            <Link href="#contexts">
              <Button
                size="lg"
                px={8}
                variant="outline"
                borderColor={brandColors.primary}
                _hover={{ bg: 'whiteAlpha.100' }}
              >
                Browse contexts
              </Button>
            </Link>
            <Link href="/docs">
              <Button size="lg" px={8} variant="ghost" _hover={{ bg: 'whiteAlpha.100' }}>
                Read the docs
              </Button>
            </Link>
          </Flex>

          <Text fontSize="sm" color="gray.500">
            No account needed to talk to a context.
          </Text>
        </VStack>
      </Box>

      <VStack gap={{ base: 12, md: 16 }} align="stretch">
        <SectionHeading title="Three things it does differently">
          Not a wrapper with a prompt in it. The way answers are produced, paid for, and traced is
          the product.
        </SectionHeading>

        <SimpleGrid columns={{ base: 1, md: 3 }} gap={{ base: 8, md: 8 }}>
          {pillars.map(pillar => (
            <Stack
              key={pillar.title}
              gap={6}
              p={{ base: 7, md: 8 }}
              borderWidth="1px"
              borderColor="whiteAlpha.200"
              borderRadius="xl"
              transition="all 0.2s ease-in-out"
              _hover={{
                borderColor: brandColors.accent,
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 20px rgba(69, 162, 248, 0.15)',
              }}
            >
              <Flex
                align="center"
                justify="center"
                w={11}
                h={11}
                borderRadius="lg"
                bg="whiteAlpha.100"
                color={brandColors.accent}
              >
                <Icon as={pillar.icon} boxSize={5} aria-hidden="true" />
              </Flex>

              <Box>
                <Text
                  fontSize="xs"
                  textTransform="uppercase"
                  letterSpacing="wider"
                  color={brandColors.primary}
                  fontWeight="bold"
                  mb={2}
                >
                  {pillar.eyebrow}
                </Text>
                <Heading as="h3" size="md" lineHeight="1.35">
                  {pillar.title}
                </Heading>
              </Box>

              <Text color="gray.400" fontSize="sm" lineHeight="1.8">
                {pillar.body}
              </Text>

              <Stack as="ul" gap={3} listStyleType="none">
                {pillar.points.map(point => (
                  <Flex as="li" key={point} gap={3} align="baseline">
                    <Box as="span" color={brandColors.accent} aria-hidden="true">
                      —
                    </Box>
                    <Text color="gray.300" fontSize="sm" lineHeight="1.6">
                      {point}
                    </Text>
                  </Flex>
                ))}
              </Stack>
            </Stack>
          ))}
        </SimpleGrid>
      </VStack>

      <VStack gap={{ base: 12, md: 16 }} align="stretch">
        <SectionHeading title="Two steps, and it is live">
          No SDK to install, no migration, nothing to run. Your context is a URL and one HTTP call.
        </SectionHeading>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap={{ base: 8, md: 8 }}>
          <Stack
            gap={5}
            p={{ base: 7, md: 8 }}
            borderWidth="1px"
            borderColor="whiteAlpha.200"
            borderRadius="xl"
          >
            <Flex align="center" gap={4}>
              <StepBadge>1</StepBadge>
              <Heading as="h3" size="md">
                Create your context
              </Heading>
            </Flex>
            <Text color="gray.400" fontSize="sm" lineHeight="1.8">
              Name it, upload the documents that matter — notes, FAQs, product docs, course material
              — and save. It answers from them the moment you do.
            </Text>
          </Stack>

          <Stack
            gap={5}
            p={{ base: 7, md: 8 }}
            borderWidth="1px"
            borderColor="whiteAlpha.200"
            borderRadius="xl"
          >
            <Flex align="center" gap={4}>
              <StepBadge>2</StepBadge>
              <Heading as="h3" size="md">
                Share it, or plug it in
              </Heading>
            </Flex>
            <Text color="gray.400" fontSize="sm" lineHeight="1.8">
              Send the link and anyone can start talking to it — no install, no account on their
              side. Or keep your own interface and call the API from your site.
            </Text>
          </Stack>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap={8}>
          <Stack gap={4}>
            <Text fontSize="sm" fontWeight="bold" color="gray.300">
              Share a link
            </Text>
            <Snippet code={shareExample} label="context link" />
          </Stack>
          <Stack gap={4}>
            <Text fontSize="sm" fontWeight="bold" color="gray.300">
              Or call it from anywhere
            </Text>
            <Snippet code={integrateExample} label="request" />
          </Stack>
        </SimpleGrid>

        <Box
          borderWidth="1px"
          borderColor="whiteAlpha.200"
          borderRadius="xl"
          p={{ base: 7, md: 10 }}
        >
          <VStack gap={6}>
            <Text
              fontSize="xs"
              textTransform="uppercase"
              letterSpacing="wider"
              color={brandColors.primary}
              fontWeight="bold"
            >
              What you do not have to build
            </Text>
            <Flex as="ul" gap={3} wrap="wrap" justify="center" listStyleType="none">
              {notNeeded.map(item => (
                <Flex
                  as="li"
                  key={item}
                  align="center"
                  gap={2}
                  px={4}
                  py={2}
                  borderWidth="1px"
                  borderColor="whiteAlpha.200"
                  borderRadius="full"
                >
                  <Icon as={FiX} boxSize={3.5} color={brandColors.accent} aria-hidden="true" />
                  <Text fontSize="sm" color="gray.400">
                    {item}
                  </Text>
                </Flex>
              ))}
            </Flex>
            <Text fontSize="sm" color="gray.300" textAlign="center">
              One POST from your own site, and you are done.
            </Text>
          </VStack>
        </Box>

        <Flex justify="center">
          <Link href="/docs#share">
            <Button size="md" variant="ghost" _hover={{ bg: 'whiteAlpha.100' }}>
              See the integration guide
              <Icon as={FiArrowRight} boxSize={4} aria-hidden="true" />
            </Button>
          </Link>
        </Flex>
      </VStack>

      <VStack gap={7} textAlign="center" maxW="640px" mx="auto">
        <Heading as="h2" size={{ base: 'lg', md: 'xl' }}>
          Ready when you are
        </Heading>
        <Text color="gray.400" fontSize={{ base: 'md', md: 'lg' }} lineHeight="1.8">
          Start with one context and a handful of documents. Your users get answers they can trace,
          on the model they trust — and stay anonymous the whole way.
        </Text>
        <Link href="/dashboard">
          <Button
            size="lg"
            px={8}
            variant="outline"
            borderColor={brandColors.primary}
            _hover={{ bg: 'whiteAlpha.100' }}
          >
            Create a context
          </Button>
        </Link>
      </VStack>

      <VStack id="contexts" gap={{ base: 12, md: 16 }} align="stretch" scrollMarginTop="88px">
        <SectionHeading title="Available contexts">
          Every one of these was built by someone, out of documents they picked. Open one and ask it
          something — no account, nothing to install.
        </SectionHeading>

        {isLoading ? (
          <Box textAlign="center" py={10}>
            <Spinner />
          </Box>
        ) : error ? (
          <VStack gap={3} py={10} textAlign="center">
            <Text color="red.400">{error}</Text>
            <Text color="gray.500" fontSize="sm">
              Make sure the Rukh API is running and reachable.
            </Text>
          </VStack>
        ) : contexts.length === 0 ? (
          <Text color="gray.500" fontSize="sm" textAlign="center">
            No contexts available yet — yours could be the first.
          </Text>
        ) : (
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={{ base: 6, md: 8 }}>
            {contexts.map(context => (
              <ContextCard
                key={context.name}
                context={context}
                footer={
                  <Link href={`/${context.name}`} style={{ width: '100%' }}>
                    <Button
                      w="100%"
                      size="sm"
                      variant="outline"
                      borderColor={brandColors.primary}
                      _hover={{ bg: 'whiteAlpha.100' }}
                    >
                      Interact
                    </Button>
                  </Link>
                }
              />
            ))}
          </SimpleGrid>
        )}
      </VStack>

      <Box
        borderTopWidth="1px"
        borderColor="whiteAlpha.200"
        pt={{ base: 16, md: 20 }}
        css={{
          backgroundImage:
            'radial-gradient(ellipse 60% 100% at 50% 100%, rgba(140, 28, 132, 0.18), transparent 70%)',
        }}
      >
        <VStack gap={7} textAlign="center" maxW="640px" mx="auto">
          <Heading as="h2" size={{ base: 'lg', md: 'xl' }}>
            Don&apos;t be shy to ask
          </Heading>
          <Text color="gray.400" fontSize={{ base: 'md', md: 'lg' }} lineHeight="1.8">
            Stuck on your first context? Wondering whether Rukh fits what you have in mind? Found
            something that looks broken? Write in. Every question is a fair question, and a human
            answers.
          </Text>
          <Flex gap={4} flexWrap="wrap" justify="center">
            <ChakraLink
              href="https://julienberanger.com/contact"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="md"
                px={6}
                variant="outline"
                borderColor={brandColors.primary}
                _hover={{ bg: 'whiteAlpha.100' }}
              >
                Get in touch
              </Button>
            </ChakraLink>
            <ChakraLink href="mailto:support@rukh.it">
              <Button size="md" px={6} variant="ghost" _hover={{ bg: 'whiteAlpha.100' }}>
                support@rukh.it
              </Button>
            </ChakraLink>
          </Flex>
        </VStack>
      </Box>
    </VStack>
  )
}
