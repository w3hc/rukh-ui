'use client'

import { Container, Heading, Text, useToast, Button, Tooltip, Box, VStack } from '@chakra-ui/react'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'

export default function CreatePage() {
  const [isLoading, setIsLoading] = useState(false)

  const t = useTranslation()

  useEffect(() => {}, [])

  return (
    <main>
      <Container maxW="container.sm" py={20}>
        <VStack spacing={6} align="stretch">
          <header>
            <Heading as="h1" size="xl" mb={2}>
              {t.newPage.title}
            </Heading>
            <Text fontSize="lg" color="gray.400">
              {t.newPage.subtitle}
            </Text>
          </header>

          <nav aria-label="Main Navigation">
            <Link href="/" style={{ color: '#45a2f8', textDecoration: 'underline' }}>
              {t.newPage.backHome}
            </Link>
          </nav>
        </VStack>
      </Container>
    </main>
  )
}
