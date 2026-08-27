'use client'

import { NativeSelect } from '@chakra-ui/react'
import { forwardRef } from 'react'

/**
 * Native `<select>` styled to match `Input`. Native rather than Chakra's
 * portalled Select so it behaves correctly inside a Dialog and on mobile.
 */
export const Select = forwardRef<
  HTMLSelectElement,
  React.ComponentProps<typeof NativeSelect.Field> & { invalid?: boolean }
>(({ children, invalid, ...props }, ref) => {
  return (
    <NativeSelect.Root invalid={invalid}>
      <NativeSelect.Field
        ref={ref}
        pl={3}
        pr={8}
        py={2}
        bg="gray.900"
        color="white"
        borderColor="gray.600"
        borderWidth="1px"
        _hover={{ borderColor: 'gray.500' }}
        _focus={{
          borderColor: '#45a2f8',
          boxShadow: '0 0 0 1px #45a2f8',
          bg: 'gray.800',
        }}
        {...props}
      >
        {children}
      </NativeSelect.Field>
      <NativeSelect.Indicator />
    </NativeSelect.Root>
  )
})

Select.displayName = 'Select'
