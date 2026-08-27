'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import {
  Badge,
  Box,
  Card,
  CloseButton,
  Flex,
  Heading,
  HStack,
  Link as ChakraLink,
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
import { Input } from '@/components/ui/input'
import { Field } from '@/components/ui/field'
import { Dialog, Portal } from '@/components/ui/dialog'
import { toaster } from '@/components/ui/toaster'
import Link from 'next/link'
import { FiArrowLeft, FiEdit2, FiFileText, FiLink, FiLock, FiPlus, FiTrash2 } from 'react-icons/fi'
import Spinner from '@/components/Spinner'
import LoginButton from '@/components/LoginButton'
import { useW3PK } from '@/context/W3PK'
import { brandColors } from '@/theme'
import { formatFileSize } from '@/utils/contexts'
import {
  addLink,
  ApiError,
  deleteFile,
  deleteLink,
  getFileContent,
  listContextFiles,
  listContexts,
  listLinks,
  RemoteContextFile,
  RemoteContextLink,
  uploadFile,
} from '@/utils/api'

interface DocumentForm {
  originalName: string | null // null = adding a new document
  name: string
  description: string
  content: string
  loadingContent: boolean
}

interface LinkForm {
  originalUrl: string | null // null = adding a new link
  title: string
  url: string
  description: string
}

type DeleteTarget = { type: 'document'; name: string } | { type: 'link'; url: string }

export default function ContextEditPage() {
  const params = useParams<{ context: string }>()
  const contextName = params.context
  const { isAuthenticated, signSiwe } = useW3PK()

  const [contextExists, setContextExists] = useState<boolean | undefined>(undefined) // undefined = loading
  const [filesStatus, setFilesStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [filesError, setFilesError] = useState<string | null>(null)

  const [documents, setDocuments] = useState<RemoteContextFile[]>([])
  const [links, setLinks] = useState<RemoteContextLink[]>([])
  const [documentForm, setDocumentForm] = useState<DocumentForm | null>(null)
  const [linkForm, setLinkForm] = useState<LinkForm | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    listContexts()
      .then(all => {
        if (!cancelled) setContextExists(all.some(c => c.name === contextName))
      })
      .catch(() => {
        if (!cancelled) setContextExists(false)
      })
    return () => {
      cancelled = true
    }
  }, [contextName])

  const refresh = async () => {
    const [files, contextLinks] = await Promise.all([
      listContextFiles(contextName, signSiwe),
      listLinks(contextName, signSiwe),
    ])
    setDocuments(files)
    setLinks(contextLinks)
  }

  useEffect(() => {
    if (!contextExists || !isAuthenticated) return
    let cancelled = false
    Promise.all([listContextFiles(contextName, signSiwe), listLinks(contextName, signSiwe)])
      .then(([files, contextLinks]) => {
        if (cancelled) return
        setDocuments(files)
        setLinks(contextLinks)
        setFilesStatus('ready')
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setFilesError(
          err instanceof ApiError && err.status === 401
            ? "You're not the creator of this context, so you can't manage it."
            : err instanceof ApiError
              ? err.message
              : 'Could not load this context.'
        )
        setFilesStatus('error')
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextExists, isAuthenticated, contextName])

  const handleAuthError = (err: unknown) => {
    if (err instanceof ApiError && err.status === 401) {
      toaster.create({
        title: "You're not the creator of this context",
        description: 'Only the wallet that created it can make changes.',
        type: 'error',
        duration: 4000,
      })
      return true
    }
    return false
  }

  if (contextExists === undefined) {
    return (
      <Box textAlign="center" py={20}>
        <Spinner />
      </Box>
    )
  }

  if (!contextExists) {
    return (
      <VStack gap={4} py={20} textAlign="center">
        <Heading as="h1" size="lg">
          Context not found
        </Heading>
        <Text color="gray.400">No context named &ldquo;{contextName}&rdquo; is available.</Text>
        <Link href="/">
          <Button variant="outline" size="sm">
            <FiArrowLeft aria-hidden="true" /> Back to all contexts
          </Button>
        </Link>
      </VStack>
    )
  }

  if (!isAuthenticated) {
    return (
      <VStack gap={4} py={20} textAlign="center">
        <FiLock size={28} color={brandColors.accent} />
        <Heading as="h1" size="lg">
          Sign in to edit &ldquo;{contextName}&rdquo;
        </Heading>
        <Text color="gray.400" fontSize="sm">
          Managing documents and links requires signing with the wallet that created this context.
        </Text>
        <LoginButton size="sm" />
        <Link href={`/${contextName}`}>
          <Button variant="ghost" size="sm">
            <FiArrowLeft aria-hidden="true" /> Back to chat
          </Button>
        </Link>
      </VStack>
    )
  }

  if (filesStatus === 'loading') {
    return (
      <Box textAlign="center" py={20}>
        <Spinner />
      </Box>
    )
  }

  if (filesStatus === 'error') {
    return (
      <VStack gap={4} py={20} textAlign="center">
        <Heading as="h1" size="lg">
          Can&rsquo;t manage &ldquo;{contextName}&rdquo;
        </Heading>
        <Text color="gray.400" fontSize="sm">
          {filesError}
        </Text>
        <Link href={`/${contextName}`}>
          <Button variant="outline" size="sm">
            <FiArrowLeft aria-hidden="true" /> Back to chat
          </Button>
        </Link>
      </VStack>
    )
  }

  const openNewDocument = () =>
    setDocumentForm({
      originalName: null,
      name: '',
      description: '',
      content: '',
      loadingContent: false,
    })

  const openEditDocument = async (document: RemoteContextFile) => {
    setDocumentForm({
      originalName: document.name,
      name: document.name,
      description: document.description,
      content: '',
      loadingContent: true,
    })
    try {
      const content = await getFileContent(contextName, document.name, signSiwe)
      setDocumentForm(f =>
        f && f.originalName === document.name ? { ...f, content, loadingContent: false } : f
      )
    } catch (err) {
      if (!handleAuthError(err)) {
        toaster.create({
          title: 'Could not load file content',
          description: err instanceof ApiError ? err.message : undefined,
          type: 'error',
          duration: 4000,
        })
      }
      setDocumentForm(null)
    }
  }

  const saveDocument = async () => {
    if (!documentForm) return
    const rawName = documentForm.name.trim()
    if (!rawName) return
    const name = rawName.endsWith('.md') ? rawName : `${rawName}.md`

    setIsSaving(true)
    try {
      await uploadFile({
        contextName,
        filename: name,
        content: documentForm.content,
        description: documentForm.description.trim(),
        signSiwe,
      })
      // Renaming: the old file stays around under its previous name, remove it.
      if (documentForm.originalName && documentForm.originalName !== name) {
        await deleteFile(contextName, documentForm.originalName, signSiwe)
      }
      await refresh()
      toaster.create({
        title: documentForm.originalName ? 'Document updated' : 'Document added',
        description: name,
        type: 'success',
        duration: 4000,
      })
      setDocumentForm(null)
    } catch (err) {
      if (!handleAuthError(err)) {
        toaster.create({
          title: 'Could not save document',
          description: err instanceof ApiError ? err.message : undefined,
          type: 'error',
          duration: 4000,
        })
      }
    } finally {
      setIsSaving(false)
    }
  }

  const saveLink = async () => {
    if (!linkForm) return
    const url = linkForm.url.trim()
    if (!url) return

    setIsSaving(true)
    try {
      // No update endpoint: remove the previous entry (by its original URL) before adding the new one.
      if (linkForm.originalUrl) {
        await deleteLink(contextName, linkForm.originalUrl, signSiwe)
      }
      await addLink(
        contextName,
        {
          title: linkForm.title.trim() || url,
          url,
          description: linkForm.description.trim() || undefined,
        },
        signSiwe
      )
      await refresh()
      toaster.create({
        title: linkForm.originalUrl ? 'Link updated' : 'Link added',
        description: url,
        type: 'success',
        duration: 4000,
      })
      setLinkForm(null)
    } catch (err) {
      if (!handleAuthError(err)) {
        toaster.create({
          title: 'Could not save link',
          description: err instanceof ApiError ? err.message : undefined,
          type: 'error',
          duration: 4000,
        })
      }
    } finally {
      setIsSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setIsSaving(true)
    try {
      if (deleteTarget.type === 'document') {
        await deleteFile(contextName, deleteTarget.name, signSiwe)
      } else {
        await deleteLink(contextName, deleteTarget.url, signSiwe)
      }
      await refresh()
      toaster.create({
        title: deleteTarget.type === 'document' ? 'Document deleted' : 'Link deleted',
        type: 'info',
        duration: 4000,
      })
      setDeleteTarget(null)
    } catch (err) {
      if (!handleAuthError(err)) {
        toaster.create({
          title: 'Could not delete',
          description: err instanceof ApiError ? err.message : undefined,
          type: 'error',
          duration: 4000,
        })
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <VStack gap={6} align="stretch" py={8}>
      {/* Page header */}
      <Box>
        <HStack gap={3} mb={1}>
          <Link href={`/${contextName}`}>
            <IconButton aria-label={`Back to ${contextName}`} variant="ghost" size="sm">
              <FiArrowLeft />
            </IconButton>
          </Link>
          <Heading as="h1" size="lg">
            Edit{' '}
            <Box as="span" color={brandColors.accent}>
              {contextName}
            </Box>
          </Heading>
        </HStack>
        <Text color="gray.400" fontSize="sm" pl={12}>
          Manage the documents and links that make up this context.
        </Text>
      </Box>

      <TabsRoot defaultValue="documents" colorPalette="purple">
        <TabsList>
          <TabsTrigger value="documents" pr={4}>
            <FiFileText aria-hidden="true" /> Documents ({documents.length})
          </TabsTrigger>
          <TabsTrigger value="links" pr={4}>
            <FiLink aria-hidden="true" /> Links ({links.length})
          </TabsTrigger>
        </TabsList>

        {/* Documents tab */}
        <TabsContent value="documents">
          <VStack gap={4} align="stretch" pt={4}>
            <Flex justify="flex-end">
              <Button
                size="sm"
                variant="outline"
                borderColor={brandColors.primary}
                _hover={{ bg: 'whiteAlpha.100' }}
                onClick={openNewDocument}
              >
                <FiPlus aria-hidden="true" /> Add document
              </Button>
            </Flex>
            {documents.length === 0 && (
              <Text color="gray.500" textAlign="center" py={10}>
                No documents yet. Add a markdown file to feed this context.
              </Text>
            )}
            {documents.map(document => (
              <Card.Root key={document.name} borderWidth="1px" borderColor="whiteAlpha.200">
                <Card.Body p={4}>
                  <Flex justify="space-between" align="center" gap={4}>
                    <Box minW={0}>
                      <HStack gap={3}>
                        <Text fontWeight="medium" truncate>
                          {document.name}
                        </Text>
                        <Badge variant="subtle" colorPalette="gray">
                          {formatFileSize(document.size)}
                        </Badge>
                      </HStack>
                      <Text fontSize="sm" color="gray.400" truncate>
                        {document.description || 'No description'}
                      </Text>
                    </Box>
                    <HStack gap={1} flexShrink={0}>
                      <IconButton
                        aria-label={`Edit ${document.name}`}
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDocument(document)}
                      >
                        <FiEdit2 />
                      </IconButton>
                      <IconButton
                        aria-label={`Delete ${document.name}`}
                        variant="ghost"
                        size="sm"
                        colorPalette="red"
                        onClick={() => setDeleteTarget({ type: 'document', name: document.name })}
                      >
                        <FiTrash2 />
                      </IconButton>
                    </HStack>
                  </Flex>
                </Card.Body>
              </Card.Root>
            ))}
          </VStack>
        </TabsContent>

        {/* Links tab */}
        <TabsContent value="links">
          <VStack gap={4} align="stretch" pt={4}>
            <Flex justify="flex-end">
              <Button
                size="sm"
                variant="outline"
                borderColor={brandColors.primary}
                _hover={{ bg: 'whiteAlpha.100' }}
                onClick={() =>
                  setLinkForm({ originalUrl: null, title: '', url: '', description: '' })
                }
              >
                <FiPlus aria-hidden="true" /> Add link
              </Button>
            </Flex>
            {links.length === 0 && (
              <Text color="gray.500" textAlign="center" py={10}>
                No links yet. Add URLs to enrich this context.
              </Text>
            )}
            {links.map(link => (
              <Card.Root key={link.url} borderWidth="1px" borderColor="whiteAlpha.200">
                <Card.Body p={4}>
                  <Flex justify="space-between" align="center" gap={4}>
                    <Box minW={0}>
                      <Text fontWeight="medium" truncate>
                        {link.title}
                      </Text>
                      <ChakraLink
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        fontSize="sm"
                        color={brandColors.accent}
                      >
                        {link.url}
                      </ChakraLink>
                      {link.description && (
                        <Text fontSize="sm" color="gray.400" truncate>
                          {link.description}
                        </Text>
                      )}
                    </Box>
                    <HStack gap={1} flexShrink={0}>
                      <IconButton
                        aria-label={`Edit ${link.title}`}
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setLinkForm({
                            originalUrl: link.url,
                            title: link.title,
                            url: link.url,
                            description: link.description ?? '',
                          })
                        }
                      >
                        <FiEdit2 />
                      </IconButton>
                      <IconButton
                        aria-label={`Delete ${link.title}`}
                        variant="ghost"
                        size="sm"
                        colorPalette="red"
                        onClick={() => setDeleteTarget({ type: 'link', url: link.url })}
                      >
                        <FiTrash2 />
                      </IconButton>
                    </HStack>
                  </Flex>
                </Card.Body>
              </Card.Root>
            ))}
          </VStack>
        </TabsContent>
      </TabsRoot>

      {/* Document add/edit dialog */}
      <Dialog.Root
        open={documentForm !== null}
        onOpenChange={(e: { open: boolean }) => !e.open && setDocumentForm(null)}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content p={6}>
              <Dialog.Header>
                <Dialog.Title>
                  {documentForm?.originalName ? 'Edit document' : 'Add document'}
                </Dialog.Title>
              </Dialog.Header>
              <Dialog.Body pt={4}>
                {documentForm?.loadingContent ? (
                  <Box textAlign="center" py={10}>
                    <Spinner />
                  </Box>
                ) : (
                  <VStack gap={4}>
                    <Field label="File name">
                      <Input
                        value={documentForm?.name ?? ''}
                        onChange={e =>
                          setDocumentForm(f => (f ? { ...f, name: e.target.value } : f))
                        }
                        placeholder="my-notes.md"
                        pl={3}
                      />
                    </Field>
                    <Field label="Description">
                      <Input
                        value={documentForm?.description ?? ''}
                        onChange={e =>
                          setDocumentForm(f => (f ? { ...f, description: e.target.value } : f))
                        }
                        placeholder="What this document covers"
                        pl={3}
                      />
                    </Field>
                    <Field label="Content (markdown)">
                      <Textarea
                        value={documentForm?.content ?? ''}
                        onChange={e =>
                          setDocumentForm(f => (f ? { ...f, content: e.target.value } : f))
                        }
                        placeholder="# My notes..."
                        rows={8}
                        pl={3}
                      />
                    </Field>
                  </VStack>
                )}
              </Dialog.Body>
              <Dialog.Footer gap={3} pt={6}>
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline">Cancel</Button>
                </Dialog.ActionTrigger>
                <Button
                  bg={brandColors.primary}
                  color="white"
                  _hover={{ bg: brandColors.secondary }}
                  onClick={saveDocument}
                  loading={isSaving}
                  disabled={!documentForm?.name.trim() || documentForm?.loadingContent}
                >
                  {documentForm?.originalName ? 'Save changes' : 'Add document'}
                </Button>
              </Dialog.Footer>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* Link add/edit dialog */}
      <Dialog.Root
        open={linkForm !== null}
        onOpenChange={(e: { open: boolean }) => !e.open && setLinkForm(null)}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content p={6}>
              <Dialog.Header>
                <Dialog.Title>{linkForm?.originalUrl ? 'Edit link' : 'Add link'}</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body pt={4}>
                <VStack gap={4}>
                  <Field label="URL">
                    <Input
                      value={linkForm?.url ?? ''}
                      onChange={e => setLinkForm(f => (f ? { ...f, url: e.target.value } : f))}
                      placeholder="https://example.com"
                      pl={3}
                    />
                  </Field>
                  <Field label="Title">
                    <Input
                      value={linkForm?.title ?? ''}
                      onChange={e => setLinkForm(f => (f ? { ...f, title: e.target.value } : f))}
                      placeholder="Page title"
                      pl={3}
                    />
                  </Field>
                  <Field label="Description (optional)">
                    <Input
                      value={linkForm?.description ?? ''}
                      onChange={e =>
                        setLinkForm(f => (f ? { ...f, description: e.target.value } : f))
                      }
                      placeholder="What this link is about"
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
                  onClick={saveLink}
                  loading={isSaving}
                  disabled={!linkForm?.url.trim()}
                >
                  {linkForm?.originalUrl ? 'Save changes' : 'Add link'}
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
        open={deleteTarget !== null}
        onOpenChange={(e: { open: boolean }) => !e.open && setDeleteTarget(null)}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content p={6}>
              <Dialog.Header>
                <Dialog.Title>
                  Delete {deleteTarget?.type === 'document' ? 'document' : 'link'}?
                </Dialog.Title>
              </Dialog.Header>
              <Dialog.Body pt={4}>
                <Text fontSize="sm" color="gray.400">
                  {deleteTarget?.type === 'document'
                    ? `"${deleteTarget.name}" will be removed from this context.`
                    : deleteTarget
                      ? `"${deleteTarget.url}" will be removed from this context.`
                      : ''}{' '}
                  This cannot be undone.
                </Text>
              </Dialog.Body>
              <Dialog.Footer gap={3} pt={6}>
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline">Cancel</Button>
                </Dialog.ActionTrigger>
                <Button colorPalette="red" onClick={confirmDelete} loading={isSaving}>
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
