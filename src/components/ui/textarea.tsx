'use client'

import { Textarea as ChakraTextarea } from '@chakra-ui/react'
import { forwardRef, useCallback, useLayoutEffect, useRef } from 'react'

/**
 * Multi-line counterpart to `Input`, styled to match it.
 *
 * A single-line `<input>` silently strips newlines out of pasted text, which
 * destroys the row structure of anything tabular (a CSV export, a log, a
 * spreadsheet column) before it ever reaches the API. Chat input has to be a
 * textarea for that reason, not for the sake of composing long prose.
 *
 * Grows with its content up to `maxHeight`, then scrolls.
 */
export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<typeof ChakraTextarea> & { maxHeight?: number }
>(({ maxHeight = 200, onChange, value, ...props }, ref) => {
  const innerRef = useRef<HTMLTextAreaElement | null>(null)

  // Reset to `auto` first: scrollHeight only shrinks back down once the
  // element is no longer being held open by its own inline height.
  const resize = useCallback(() => {
    const el = innerRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`
    el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden'
  }, [maxHeight])

  // Layout effect rather than an onChange hook so the box is also correct
  // after the parent clears `value` on submit.
  useLayoutEffect(resize, [resize, value])

  return (
    <ChakraTextarea
      ref={el => {
        innerRef.current = el
        if (typeof ref === 'function') ref(el)
        else if (ref) ref.current = el
      }}
      value={value}
      onChange={onChange}
      rows={1}
      resize="none"
      pl={3}
      pr={3}
      py={2}
      bg="gray.900"
      borderColor="gray.600"
      borderWidth="1px"
      _hover={{ borderColor: 'gray.500' }}
      _focus={{
        borderColor: '#45a2f8',
        boxShadow: '0 0 0 1px #45a2f8',
        bg: 'gray.800',
      }}
      _placeholder={{ color: 'gray.500' }}
      {...props}
    />
  )
})

Textarea.displayName = 'Textarea'
