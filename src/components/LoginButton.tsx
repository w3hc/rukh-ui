'use client'

import { Text, useDisclosure, VStack, Link as ChakraLink, CloseButton } from '@chakra-ui/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field } from '@/components/ui/field'
import { Dialog, Portal } from '@/components/ui/dialog'
import Spinner from './Spinner'
import { useTranslation } from '@/hooks/useTranslation'
import { useW3PK } from '@/context/W3PK'
import { useState } from 'react'
import { toaster } from '@/components/ui/toaster'
import { brandColors } from '@/theme'

type LoginButtonProps = React.ComponentProps<typeof Button>

export default function LoginButton(props: LoginButtonProps) {
  const { login, register } = useW3PK()
  const t = useTranslation()
  const { open: isOpen, onOpen, onClose } = useDisclosure()
  const [username, setUsername] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [isUsernameInvalid, setIsUsernameInvalid] = useState(false)

  const validateUsername = (input: string): boolean => {
    if (!input.trim()) {
      return true
    }

    const trimmedInput = input.trim()

    // Check overall format and length (3-50 chars)
    // Alphanumeric, underscore, and hyphen allowed
    // Must start and end with alphanumeric
    const formatValid =
      /^[a-zA-Z0-9]([a-zA-Z0-9_-]*[a-zA-Z0-9])?$/.test(trimmedInput) &&
      trimmedInput.length >= 3 &&
      trimmedInput.length <= 50

    return formatValid
  }

  const handleLogin = async () => {
    // Check if credentials exist in localStorage or IndexedDB
    const hasCredentials = await checkForExistingCredentials()

    if (hasCredentials) {
      // User has credentials - perform normal login
      await login()
    } else {
      // No credentials - prompt for registration
      onOpen()
    }
  }

  const checkForExistingCredentials = async (): Promise<boolean> => {
    try {
      if (typeof window === 'undefined') {
        return false
      }

      // First check for persistent session in IndexedDB
      if (window.indexedDB) {
        const dbName = 'Web3PasskeyPersistentSessions'
        const storeName = 'sessions'

        const hasPersistentSession = await new Promise<boolean>(resolve => {
          const request = indexedDB.open(dbName)

          request.onerror = () => {
            resolve(false)
          }

          request.onsuccess = event => {
            const db = (event.target as IDBOpenDBRequest).result

            if (!db.objectStoreNames.contains(storeName)) {
              db.close()
              resolve(false)
              return
            }

            try {
              const transaction = db.transaction([storeName], 'readonly')
              const objectStore = transaction.objectStore(storeName)
              const countRequest = objectStore.count()

              countRequest.onsuccess = () => {
                db.close()
                resolve(countRequest.result > 0)
              }

              countRequest.onerror = () => {
                db.close()
                resolve(false)
              }
            } catch {
              db.close()
              resolve(false)
            }
          }
        })

        if (hasPersistentSession) {
          return true
        }
      }

      // Then check for w3pk_credential_index in localStorage
      const credentialIndex = localStorage.getItem('w3pk_credential_index')
      if (credentialIndex) {
        return true
      }

      return false
    } catch {
      return false
    }
  }

  const handleRegister = async () => {
    if (!username.trim()) {
      toaster.create({
        title: 'Username Required',
        description: 'Please enter a username to register.',
        type: 'warning',
        duration: 3000,
      })
      setIsUsernameInvalid(true)
      return
    }

    const isValid = validateUsername(username)
    if (!isValid) {
      setIsUsernameInvalid(true)
      return
    }

    setIsUsernameInvalid(false)

    try {
      setIsRegistering(true)
      console.log('[LoginButton] Starting registration for:', username.trim())

      // Add timeout to prevent infinite loading
      const registrationPromise = register(username.trim())
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Registration timeout after 60 seconds')), 60000)
      )

      await Promise.race([registrationPromise, timeoutPromise])

      console.log('[LoginButton] Registration completed successfully')
      setUsername('')
      onClose()
    } catch (error: any) {
      console.error('[LoginButton] Registration failed:', error)

      // Show user-friendly error message
      toaster.create({
        title: 'Registration Failed',
        description: error.message || 'Unable to complete registration. Please try again.',
        type: 'error',
        duration: 8000,
      })
    } finally {
      console.log('[LoginButton] Cleaning up registration state')
      setIsRegistering(false)
    }
  }

  const handleUsernameChange = (value: string) => {
    setUsername(value)
    if (validateUsername(value)) {
      setIsUsernameInvalid(false)
    }
  }

  const handleModalClose = () => {
    setUsername('')
    setIsUsernameInvalid(false)
    onClose()
  }

  return (
    <>
      <Button
        bg={brandColors.primary}
        color="white"
        _hover={{
          bg: brandColors.secondary,
        }}
        onClick={handleLogin}
        {...props}
      >
        {t.common.login}
      </Button>

      {/* Registration Modal */}
      <Dialog.Root
        open={isOpen}
        onOpenChange={(e: { open: boolean }) => (e.open ? null : handleModalClose())}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content p={6}>
              <Dialog.Header>
                <Dialog.Title>Register New Account</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body pt={4}>
                <VStack gap={4}>
                  <Text fontSize="sm" color="gray.400">
                    An Ethereum wallet will be created and securely stored on your device, protected
                    by your biometric or PIN thanks to{' '}
                    <ChakraLink
                      href={'https://github.com/w3hc/w3pk/blob/main/src/auth/register.ts#L17-L102'}
                      color={brandColors.accent}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      w3pk
                    </ChakraLink>
                    .
                  </Text>
                  <Field invalid={isUsernameInvalid} label="Username">
                    <Input
                      id="username-input"
                      aria-describedby={
                        isUsernameInvalid && username.trim() ? 'username-error' : undefined
                      }
                      aria-invalid={isUsernameInvalid && username.trim() ? true : undefined}
                      value={username}
                      onChange={e => handleUsernameChange(e.target.value)}
                      placeholder="Enter your username"
                      pl={3}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && username.trim()) {
                          handleRegister()
                        }
                      }}
                    />
                    {isUsernameInvalid && username.trim() && (
                      <Field.ErrorText id="username-error">
                        Username must be 3-50 characters long and contain only letters, numbers,
                        underscores, and hyphens. It must start and end with a letter or number.
                      </Field.ErrorText>
                    )}
                  </Field>
                </VStack>
              </Dialog.Body>

              <Dialog.Footer gap={3} pt={6}>
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline">Cancel</Button>
                </Dialog.ActionTrigger>
                <Button colorPalette="blue" onClick={handleRegister} disabled={!username.trim()}>
                  {isRegistering && <Spinner size="50px" />}
                  {!isRegistering && 'Create Account'}
                </Button>
              </Dialog.Footer>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  )
}
