'use client'

import { useEffect, useState } from 'react'
import { Box, Heading, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import ContextCard from '@/components/ContextCard'
import Spinner from '@/components/Spinner'
import { brandColors } from '@/theme'
import { RukhContext } from '@/utils/contexts'
import { ApiError, listContexts } from '@/utils/api'

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
    <VStack gap={10} align="stretch" py={16}>
      <Box textAlign="center">
        <Heading as="h1" size="2xl" mb={3}>
          Build your own AI
        </Heading>
        <Text color="gray.400" fontSize="lg">
          Pick a context and start the conversation.
        </Text>
      </Box>

      {isLoading ? (
        <Box textAlign="center" py={10}>
          <Spinner />
        </Box>
      ) : error ? (
        <VStack gap={2} py={10} textAlign="center">
          <Text color="red.400">{error}</Text>
          <Text color="gray.500" fontSize="sm">
            Make sure the Rukh API is running and reachable.
          </Text>
        </VStack>
      ) : contexts.length === 0 ? (
        <Text color="gray.500" fontSize="sm" textAlign="center">
          No contexts available yet.
        </Text>
      ) : (
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={5}>
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
  )
}
