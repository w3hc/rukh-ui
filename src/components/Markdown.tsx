'use client'

import { useEffect, useRef, useState, type ComponentPropsWithoutRef } from 'react'
import { Box } from '@chakra-ui/react'
import ReactMarkdown, { type Components, type ExtraProps } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { IconButton } from '@/components/ui/icon-button'
import { toaster } from '@/components/ui/toaster'
import { brandColors } from '@/theme'
import { FiCheck, FiCopy } from 'react-icons/fi'

/**
 * A code block with a copy button, for answers whose payload is the block
 * itself — a column to paste back into a spreadsheet, a command to run. Mirrors
 * `Snippet`, which does the same for hand-written code on the static pages;
 * this one reads its text from the rendered `<pre>` instead, since the content
 * arrives as markdown children rather than as a string prop. `innerText` is
 * what is on screen, newlines included.
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

  return (
    <Box>
      <pre ref={ref} {...props}>
        {children}
      </pre>
      {/* Below the block rather than over it: the button never covers code, and
          a long first line needs no padding carved out for it. */}
      <Box display="flex" justifyContent="flex-end" marginTop="0.75rem" marginBottom="0.75rem">
        <IconButton
          aria-label={copied ? 'Copied' : 'Copy to clipboard'}
          size="xs"
          variant="outline"
          // Picks up the block's own blue border, so the pair reads as one unit.
          color={brandColors.accent}
          borderColor={brandColors.accent}
          bg="transparent"
          transition="background 0.15s"
          _hover={{ bg: 'rgba(69, 162, 248, 0.12)' }}
          onClick={handleCopy}
        >
          {copied ? <FiCheck /> : <FiCopy />}
        </IconButton>
      </Box>
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
 * code block's copy button.
 */
export default function Markdown({ children }: { children: string }) {
  return (
    <Box
      css={{
        '& > *:first-of-type': { marginTop: 0 },
        // A code block is wrapped for its copy button, so the reset above lands
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
          // Longhand, not the `border` shorthand: Chakra's preflight sets
          // `border-style: solid` on `*`, and dashes are what survives it
          // legibly at 1px — `dotted` this thin reads as a faded solid line.
          borderWidth: '1px',
          borderStyle: 'dashed',
          borderColor: brandColors.accent,
          padding: '0.75rem 1rem',
          borderRadius: '0.5rem',
          overflowX: 'auto',
          // No bottom margin: the copy button sits under the block and carries
          // the gap to whatever follows.
          margin: '0.75rem 0 0',
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
