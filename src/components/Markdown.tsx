'use client'

import { useEffect, useRef, useState, type ComponentPropsWithoutRef } from 'react'
import { Box, HStack } from '@chakra-ui/react'
import ReactMarkdown, { type Components, type ExtraProps } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { IconButton } from '@/components/ui/icon-button'
import { toaster } from '@/components/ui/toaster'
import { brandColors } from '@/theme'
import { FiCheck, FiCopy, FiDownload } from 'react-icons/fi'

/**
 * File extension for a fence's language. react-markdown puts the language on
 * the inner `code` as `language-csv`; anything unlabelled or unrecognised is
 * text, which every editor and spreadsheet will still open.
 */
const EXTENSION_BY_LANGUAGE: Record<string, string> = {
  csv: 'csv',
  json: 'json',
  md: 'md',
  markdown: 'md',
}

/**
 * A code block with copy and download buttons, for answers whose payload is the
 * block itself — a column to paste back into a spreadsheet, a command to run.
 * Copying mirrors `Snippet`, which does the same for hand-written code on the
 * static pages; this one reads its text from the rendered `<pre>` instead,
 * since the content arrives as markdown children rather than as a string prop.
 * `innerText` is what is on screen, newlines included, which is also what a
 * spreadsheet needs — so the download saves exactly what the copy button puts
 * on the clipboard.
 *
 * Both buttons appear on every block, as the copy button already did. A
 * one-line `bash` block gets a pointless download button; that is the cost of
 * not guessing which blocks are payloads.
 *
 * `node` is react-markdown's own AST handle, not a DOM attribute, so it is
 * peeled off rather than spread onto the `pre`.
 */
function CodeBlock({ children, node, ...props }: ComponentPropsWithoutRef<'pre'> & ExtraProps) {
  const ref = useRef<HTMLPreElement>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(ref.current?.innerText ?? '')
      setCopied(true)
    } catch {
      toaster.create({ title: 'Could not copy to clipboard', type: 'error', duration: 3000 })
    }
  }

  const handleDownload = () => {
    const text = ref.current?.innerText ?? ''
    // The fence's language lives on the inner `code`, not on the `pre`.
    const language = ref.current?.querySelector('code')?.className.match(/language-(\w+)/)?.[1]
    const extension = (language && EXTENSION_BY_LANGUAGE[language.toLowerCase()]) || 'txt'

    // Excel on Windows reads a BOM-less UTF-8 CSV as cp1252 and turns every
    // accent into mojibake — the same failure this feature exists to avoid,
    // arriving from the other direction.
    const bom = extension === 'csv' ? '\uFEFF' : ''
    // Not named after the file that was attached: a block is not an edit of the
    // input, and a name suggesting otherwise invites overwriting the original.
    const url = URL.createObjectURL(new Blob([bom + text], { type: 'text/plain;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `rukh-answer.${extension}`
    link.click()
    URL.revokeObjectURL(url)
  }

  // The brand purple is dark, so it only reads against a light ground: a
  // near-white chip, not the block's own near-black surface.
  const chip = {
    size: 'sm',
    variant: 'solid',
    bg: 'whiteAlpha.900',
    color: brandColors.primary,
    boxShadow: 'sm',
    transition: 'background 0.15s',
    _hover: { bg: 'white' },
  } as const

  return (
    <Box position="relative">
      <pre ref={ref} {...props}>
        {children}
      </pre>
      <HStack position="absolute" top={2} right={2} gap={1}>
        <IconButton aria-label="Download as a file" {...chip} onClick={handleDownload}>
          <FiDownload />
        </IconButton>
        {/* Copy keeps the outer position it has always had. */}
        <IconButton
          aria-label={copied ? 'Copied' : 'Copy to clipboard'}
          {...chip}
          onClick={handleCopy}
        >
          {copied ? <FiCheck /> : <FiCopy />}
        </IconButton>
      </HStack>
    </Box>
  )
}

/**
 * Answers cite outside sources, so a link leaves the conversation behind if it
 * navigates in place. Anchors and mailto:/tel: hand-offs keep the current tab —
 * a new one would only end up blank.
 */
const components: Components = {
  a: ({ href, children, ...props }) => {
    const sameTab = !href || href.startsWith('#') || /^(mailto|tel):/i.test(href)
    return (
      <a
        href={href}
        {...(sameTab ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
        {...props}
      >
        {children}
      </a>
    )
  },
  pre: CodeBlock,
}

/**
 * Renders an answer's markdown as plain prose — no bubble, no card, just the
 * text with enough rhythm to read. Styling is CSS on the wrapper rather than
 * a `components` map so a half-streamed answer costs nothing to re-render; the
 * map above is module-level and holds only the anchor's link behaviour and the
 * code block's copy and download buttons.
 */
export default function Markdown({ children }: { children: string }) {
  return (
    <Box
      css={{
        '& > *:first-of-type': { marginTop: 0 },
        // A code block is wrapped for its buttons, so the reset above lands
        // on the wrapper rather than on the `pre` that carries the margin.
        '& > *:first-of-type > pre': { marginTop: 0 },
        '& > *:last-child': { marginBottom: 0 },
        '& h1': { fontSize: '1.5rem', fontWeight: 700, marginTop: '1.5rem', marginBottom: '1rem' },
        '& h2': {
          fontSize: '1.25rem',
          fontWeight: 700,
          marginTop: '1.25rem',
          marginBottom: '0.75rem',
        },
        '& h3': {
          fontSize: '1.125rem',
          fontWeight: 600,
          marginTop: '1rem',
          marginBottom: '0.5rem',
        },
        '& p': { marginBottom: '0.75rem', lineHeight: 1.7 },
        '& ul, & ol': { marginLeft: '1.25rem', marginBottom: '0.75rem' },
        '& li': { marginBottom: '0.25rem', lineHeight: 1.7 },
        '& strong': { fontWeight: 700 },
        '& em': { fontStyle: 'italic' },
        '& a': { color: '#45a2f8', textDecoration: 'underline' },
        '& blockquote': {
          borderLeft: '2px solid rgba(255, 255, 255, 0.2)',
          paddingLeft: '1rem',
          margin: '0.75rem 0',
          color: 'rgba(255, 255, 255, 0.7)',
        },
        '& code': {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          padding: '0.125rem 0.25rem',
          borderRadius: '0.25rem',
          fontSize: '0.875em',
          fontFamily: 'monospace',
        },
        '& pre': {
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
          padding: '0.75rem 1rem',
          // Room for the copy and download buttons so a long first line does
          // not run under them.
          paddingRight: '5rem',
          borderRadius: '0.5rem',
          overflowX: 'auto',
          margin: '0.75rem 0',
        },
        '& pre code': { backgroundColor: 'transparent', padding: 0 },
        '& table': { width: '100%', marginBottom: '0.75rem', borderCollapse: 'collapse' },
        '& th, & td': {
          border: '1px solid rgba(255, 255, 255, 0.15)',
          padding: '0.375rem 0.5rem',
          textAlign: 'left',
        },
        '& hr': { border: 0, borderTop: '1px solid rgba(255, 255, 255, 0.15)', margin: '1.5rem 0' },
      }}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </Box>
  )
}
