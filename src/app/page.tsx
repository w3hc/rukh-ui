'use client'

import { Container, Text, Box, SimpleGrid, Heading, VStack } from '@chakra-ui/react'
import Link from 'next/link'
import { useTranslation } from '@/hooks/useTranslation'
import { useTheme } from '@/context/ThemeContext'

const trades = [
  { name: 'Menuiserie', path: '/menuiserie', active: true },
  { name: 'Plomberie', path: '#', active: false },
  { name: 'Électricité', path: '#', active: false },
  { name: 'Maçonnerie', path: '#', active: false },
  { name: 'Charpenterie', path: '#', active: false },
  { name: 'Couverture', path: '#', active: false },
  { name: 'Plâtrerie', path: '#', active: false },
  { name: 'Peinture', path: '#', active: false },
  { name: 'Carrelage', path: '#', active: false },
  { name: 'Chauffage', path: '#', active: false },
  { name: 'Climatisation', path: '#', active: false },
  { name: 'Isolation', path: '#', active: false },
  { name: 'Serrurerie', path: '#', active: false },
  { name: 'Métallerie', path: '#', active: false },
  { name: 'Vitrerie', path: '#', active: false },
  { name: 'Parqueteur', path: '#', active: false },
  { name: 'Ravalement', path: '#', active: false },
  { name: 'Terrassement', path: '#', active: false },
  { name: 'VRD', path: '#', active: false },
  { name: 'Zinguerie', path: '#', active: false },
  { name: 'Étanchéité', path: '#', active: false },
  { name: 'Façadier', path: '#', active: false },
]

export default function Home() {
  const t = useTranslation()
  const { mode } = useTheme()

  return (
    <Container maxW="container.lg" py={20}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading as="h1" size="xl" mb={4}>
            Batappli IA
          </Heading>
          <Text fontSize="lg" color={mode === 'dark' ? 'gray.400' : 'gray.600'}>
            Choisissez votre corps de métier
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={4}>
          {trades.map(trade => (
            <Box key={trade.name}>
              {trade.active ? (
                <Link href={trade.path}>
                  <Box
                    p={4}
                    borderWidth="1px"
                    borderRadius="lg"
                    borderColor={mode === 'dark' ? '#45a2f8' : '#FDD69D'}
                    bg={mode === 'dark' ? 'rgba(69, 162, 248, 0.1)' : 'rgba(253, 214, 157, 0.2)'}
                    textAlign="center"
                    transition="all 0.2s"
                    cursor="pointer"
                    _hover={{
                      bg: mode === 'dark' ? 'rgba(69, 162, 248, 0.2)' : 'rgba(253, 214, 157, 0.4)',
                      transform: 'translateY(-2px)',
                    }}
                  >
                    <Text fontWeight="medium" color={mode === 'dark' ? '#45a2f8' : '#000'}>
                      {trade.name}
                    </Text>
                  </Box>
                </Link>
              ) : (
                <Box
                  p={4}
                  borderWidth="1px"
                  borderRadius="lg"
                  borderColor={mode === 'dark' ? 'gray.700' : 'gray.300'}
                  bg={mode === 'dark' ? 'gray.800' : 'gray.100'}
                  textAlign="center"
                  opacity={0.5}
                  cursor="not-allowed"
                >
                  <Text color={mode === 'dark' ? 'gray.500' : 'gray.400'}>{trade.name}</Text>
                </Box>
              )}
            </Box>
          ))}
        </SimpleGrid>
      </VStack>
    </Container>
  )
}
