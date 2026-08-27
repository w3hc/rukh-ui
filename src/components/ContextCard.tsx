'use client'

import { Card } from '@chakra-ui/react'
import Link from 'next/link'
import { brandColors } from '@/theme'
import { RukhContext } from '@/utils/contexts'

interface ContextCardProps {
  context: RukhContext
  footer?: React.ReactNode
}

export default function ContextCard({ context, footer }: ContextCardProps) {
  return (
    <Card.Root
      borderWidth="1px"
      borderColor="whiteAlpha.200"
      borderRadius="lg"
      transition="all 0.2s ease-in-out"
      _hover={{
        borderColor: brandColors.accent,
        transform: 'translateY(-2px)',
        boxShadow: `0 4px 20px rgba(69, 162, 248, 0.15)`,
      }}
      h="100%"
    >
      <Card.Body gap={3} p={5}>
        <Link href={`/${context.name}`} aria-label={`Open context ${context.name}`}>
          <Card.Title
            fontSize="lg"
            color={brandColors.accent}
            _hover={{ textDecoration: 'underline' }}
          >
            {context.name}
          </Card.Title>
        </Link>
        <Card.Description lineClamp={2}>{context.description}</Card.Description>
      </Card.Body>
      {footer && (
        <Card.Footer p={5} pt={0}>
          {footer}
        </Card.Footer>
      )}
    </Card.Root>
  )
}
