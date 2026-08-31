'use client'

import { useEffect, useState } from 'react'
import { Box } from '@chakra-ui/react'
import { IconButton } from '@/components/ui/icon-button'
import { toaster } from '@/components/ui/toaster'
import { FiCheck, FiCopy } from 'react-icons/fi'

interface SnippetProps {
  code: string
  /** Used in the copy button's accessible name, e.g. "Copy request". */
  label: string
}

/** A read-only code block with a copy-to-clipboard button. */
export default function Snippet({ code, label }: SnippetProps) {
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
