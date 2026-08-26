'use client'

import { useEffect, useState } from 'react'
import { Box, CloseButton, Flex, Heading, HStack, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
import { Input } from '@/components/ui/input'
import { Field } from '@/components/ui/field'
import { Dialog, Portal } from '@/components/ui/dialog'
import { toaster } from '@/components/ui/toaster'
import Link from 'next/link'
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi'
import ContextCard from '@/components/ContextCard'
import Spinner from '@/components/Spinner'
import { useW3PK } from '@/context/W3PK'
import { brandColors } from '@/theme'
import { RukhContext } from '@/utils/contexts'
import {
  ApiError,
  createContext as createRemoteContext,
  deleteContext,
  listContexts,
} from '@/utils/api'

interface NewContextForm {
  name: string
  description: string
  password: string
}

interface DeleteState {
  name: string
  password: string
}

export default function DashboardPage() {
  const { isAuthenticated, login } = useW3PK()
  const [contexts, setContexts] = useState<RukhContext[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newContextForm, setNewContextForm] = useState<NewContextForm | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [contextToDelete, setContextToDelete] = useState<DeleteState | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const isNameValid = (name: string) => /^[a-z0-9-]+$/.test(name)

  useEffect(() => {
    if (!isAuthenticated) return
    let cancelled = false
    listContexts()
      .then(data => {
        if (!cancelled) setContexts([...data].sort((a, b) => a.name.localeCompare(b.name)))
      })
      .catch((err: unknown) => {
        if (cancelled) return
        toaster.create({
          title: 'Could not load contexts',
          description: err instanceof ApiError ? err.message : undefined,
          type: 'error',
          duration: 4000,
        })
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [isAuthenticated])

  const createContext = async () => {
    if (!newContextForm) return
    const name = newContextForm.name.trim()
    if (!isNameValid(name) || contexts.some(c => c.name === name)) return
    if (!newContextForm.password.trim()) return

    setIsCreating(true)
    try {
      await createRemoteContext({
        name,
        password: newContextForm.password,
        description: newContextForm.description.trim(),
      })
      setContexts(prev =>
        [...prev, { name, description: newContextForm.description.trim() }].sort((a, b) =>
          a.name.localeCompare(b.name)
        )
      )
      toaster.create({
        title: 'Context created',
        description: name,
        type: 'success',
        duration: 4000,
      })
      setNewContextForm(null)
    } catch (err) {
      toaster.create({
        title: 'Could not create context',
        description: err instanceof ApiError ? err.message : undefined,
        type: 'error',
        duration: 4000,
      })
    } finally {
      setIsCreating(false)
    }
  }

  const confirmDelete = async () => {
    if (!contextToDelete || !contextToDelete.password.trim()) return
    setIsDeleting(true)
    try {
      await deleteContext(contextToDelete.name, contextToDelete.password)
      setContexts(prev => prev.filter(c => c.name !== contextToDelete.name))
      toaster.create({
        title: 'Context deleted',
        description: contextToDelete.name,
        type: 'info',
        duration: 4000,
      })
      setContextToDelete(null)
    } catch (err) {
      toaster.create({
        title:
          err instanceof ApiError && err.status === 401
            ? 'Invalid password'
            : 'Could not delete context',
        description: err instanceof ApiError ? err.message : undefined,
        type: 'error',
        duration: 4000,
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <VStack gap={4} py={20} textAlign="center">
        <Heading as="h1" size="lg">
          Dashboard
        </Heading>
        <Text color="gray.400">Please login to view your contexts.</Text>
        <Button
          bg={brandColors.primary}
          color="white"
          _hover={{ bg: brandColors.secondary }}
          size="sm"
          onClick={login}
        >
          Login
        </Button>
      </VStack>
    )
  }

  return (
    <VStack gap={8} align="stretch" py={8}>
      <Flex justify="space-between" align="flex-start" gap={4} flexWrap="wrap">
        <Box>
          <Heading as="h1" size="lg" mb={1}>
            Contexts
          </Heading>
          <Text color="gray.400" fontSize="sm">
            {contexts.length} {contexts.length === 1 ? 'context' : 'contexts'} · editing and
            deleting requires the context password
          </Text>
        </Box>
        <Button
          size="sm"
          variant="outline"
          borderColor={brandColors.primary}
          _hover={{ bg: 'whiteAlpha.100' }}
          onClick={() => setNewContextForm({ name: '', description: '', password: '' })}
        >
          <FiPlus aria-hidden="true" /> New context
        </Button>
      </Flex>

      {isLoading ? (
        <Box textAlign="center" py={10}>
          <Spinner />
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={5}>
          {contexts.map(context => (
            <ContextCard
              key={context.name}
              context={context}
              footer={
                <HStack gap={2} w="100%">
                  <Link href={`/${context.name}`} style={{ flex: 1 }}>
                    <Button
                      w="100%"
                      size="sm"
                      variant="outline"
                      borderColor={brandColors.primary}
                      _hover={{ bg: 'whiteAlpha.100' }}
                    >
                      Interact
                    </Button>
                  </Link>
                  <Link href={`/${context.name}/edit`}>
                    <IconButton aria-label={`Edit ${context.name}`} variant="ghost" size="sm">
                      <FiEdit2 />
                    </IconButton>
                  </Link>
                  <IconButton
                    aria-label={`Delete ${context.name}`}
                    variant="ghost"
                    size="sm"
                    colorPalette="red"
                    onClick={() => setContextToDelete({ name: context.name, password: '' })}
                  >
                    <FiTrash2 />
                  </IconButton>
                </HStack>
              }
            />
          ))}
        </SimpleGrid>
      )}

      {/* New context dialog */}
      <Dialog.Root
        open={newContextForm !== null}
        onOpenChange={(e: { open: boolean }) => !e.open && setNewContextForm(null)}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content p={6}>
              <Dialog.Header>
                <Dialog.Title>New context</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body pt={4}>
                <VStack gap={4}>
                  <Field
                    label="Name"
                    invalid={!!newContextForm?.name && !isNameValid(newContextForm.name)}
                    helperText="Lowercase letters, numbers, and hyphens only"
                  >
                    <Input
                      value={newContextForm?.name ?? ''}
                      onChange={e =>
                        setNewContextForm(f => (f ? { ...f, name: e.target.value } : f))
                      }
                      placeholder="my-context"
                      pl={3}
                    />
                  </Field>
                  <Field label="Description">
                    <Input
                      value={newContextForm?.description ?? ''}
                      onChange={e =>
                        setNewContextForm(f => (f ? { ...f, description: e.target.value } : f))
                      }
                      placeholder="What this context is about"
                      pl={3}
                    />
                  </Field>
                  <Field label="Password" helperText="Required to edit the context later">
                    <Input
                      type="password"
                      value={newContextForm?.password ?? ''}
                      onChange={e =>
                        setNewContextForm(f => (f ? { ...f, password: e.target.value } : f))
                      }
                      placeholder="••••••••"
                      pl={3}
                    />
                  </Field>
                </VStack>
              </Dialog.Body>
              <Dialog.Footer gap={3} pt={6}>
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline">Cancel</Button>
                </Dialog.ActionTrigger>
                <Button
                  bg={brandColors.primary}
                  color="white"
                  _hover={{ bg: brandColors.secondary }}
                  onClick={createContext}
                  loading={isCreating}
                  disabled={
                    !newContextForm ||
                    !isNameValid(newContextForm.name) ||
                    !newContextForm.password.trim()
                  }
                >
                  Create
                </Button>
              </Dialog.Footer>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* Delete confirmation dialog */}
      <Dialog.Root
        open={contextToDelete !== null}
        onOpenChange={(e: { open: boolean }) => !e.open && setContextToDelete(null)}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content p={6}>
              <Dialog.Header>
                <Dialog.Title>Delete context?</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body pt={4}>
                <VStack gap={4} align="stretch">
                  <Text fontSize="sm" color="gray.400">
                    &ldquo;{contextToDelete?.name}&rdquo; and all its documents and links will be
                    removed. This cannot be undone.
                  </Text>
                  <Field label="Password">
                    <Input
                      type="password"
                      value={contextToDelete?.password ?? ''}
                      onChange={e =>
                        setContextToDelete(d => (d ? { ...d, password: e.target.value } : d))
                      }
                      onKeyDown={e => e.key === 'Enter' && confirmDelete()}
                      placeholder="Context password"
                      pl={3}
                      autoFocus
                    />
                  </Field>
                </VStack>
              </Dialog.Body>
              <Dialog.Footer gap={3} pt={6}>
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline">Cancel</Button>
                </Dialog.ActionTrigger>
                <Button
                  colorPalette="red"
                  onClick={confirmDelete}
                  loading={isDeleting}
                  disabled={!contextToDelete?.password.trim()}
                >
                  Delete
                </Button>
              </Dialog.Footer>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </VStack>
  )
}
