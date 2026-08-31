'use client'

import { Box } from '@chakra-ui/react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'

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
}

/**
 * Renders an answer's markdown as plain prose — no bubble, no card, just the
 * text with enough rhythm to read. Styling is CSS on the wrapper rather than
 * a `components` map so a half-streamed answer costs nothing to re-render; the
 * map below is module-level and holds only the anchor's link behaviour.
 */
export default function Markdown({ children }: { children: string }) {
  return (
    <Box
      css={{
        '& > *:first-of-type': { marginTop: 0 },
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
