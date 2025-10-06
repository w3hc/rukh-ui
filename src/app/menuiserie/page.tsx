'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  Container,
  Box,
  Button,
  Flex,
  Input,
  VStack,
  Text,
  useToast,
  Link,
  Heading,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  HStack,
  Divider,
  Select,
  FormControl,
  FormLabel,
} from '@chakra-ui/react'
import { DownloadIcon, ExternalLinkIcon } from '@chakra-ui/icons'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import remarkGfm from 'remark-gfm'
import { useAppKitAccount } from '@reown/appkit/react'
import { useTheme } from '@/context/ThemeContext'

interface Message {
  text: string
  isUser: boolean
  txHash?: string
  explorerLink?: string
  containsQuote?: boolean
  quoteData?: any
}

interface ChatMessageProps {
  message: string
  isUser: boolean
  txHash?: string
  explorerLink?: string
  containsQuote?: boolean
  onDownloadQuote?: () => void
}

interface RukhResponse {
  network: string
  model: string
  txHash: string
  explorerLink: string
  output: string
  sessionId: string
}

const MarkdownComponents = (mode: 'light' | 'dark') => ({
  p: (props: any) => (
    <Text mb={2} lineHeight="tall" color="inherit">
      {props.children}
    </Text>
  ),
  h1: (props: any) => (
    <Text as="h1" fontSize="2xl" fontWeight="bold" my={4} color="inherit">
      {props.children}
    </Text>
  ),
  h2: (props: any) => (
    <Text as="h2" fontSize="xl" fontWeight="bold" my={3} color="inherit">
      {props.children}
    </Text>
  ),
  h3: (props: any) => (
    <Text as="h3" fontSize="lg" fontWeight="bold" my={2} color="inherit">
      {props.children}
    </Text>
  ),
  ul: (props: any) => (
    <Box as="ul" pl={4} my={2}>
      {props.children}
    </Box>
  ),
  ol: (props: any) => (
    <Box as="ol" pl={4} my={2}>
      {props.children}
    </Box>
  ),
  li: (props: any) => (
    <Box as="li" mb={1}>
      {props.children}
    </Box>
  ),
  code: ({ inline, className, children }: any) => {
    const match = /language-(\w+)/.exec(className || '')
    const language = match ? match[1] : ''

    if (inline) {
      return (
        <Text
          as="code"
          px={1}
          bg={mode === 'dark' ? 'gray.700' : 'gray.200'}
          borderRadius="sm"
          fontSize="0.875em"
        >
          {children}
        </Text>
      )
    }

    if (language === 'json') {
      return (
        <Box
          my={4}
          p={4}
          bg={mode === 'dark' ? 'blue.900' : 'blue.50'}
          borderRadius="md"
          border="1px"
          borderColor={mode === 'dark' ? 'blue.700' : 'blue.200'}
        >
          <Text
            fontSize="sm"
            color={mode === 'dark' ? 'blue.200' : 'blue.600'}
            mb={2}
            fontWeight="bold"
          >
            Devis Batappli IA Alpha
          </Text>
          <SyntaxHighlighter
            language={language}
            style={tomorrow}
            customStyle={{ borderRadius: '8px', fontSize: '0.85em' }}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </Box>
      )
    }

    return (
      <Box my={4}>
        <SyntaxHighlighter
          language={language}
          style={tomorrow}
          customStyle={{ borderRadius: '8px' }}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      </Box>
    )
  },
  pre: (props: any) => <Box {...props} />,
  strong: (props: any) => (
    <Text as="strong" fontWeight="bold">
      {props.children}
    </Text>
  ),
  em: (props: any) => (
    <Text as="em" fontStyle="italic">
      {props.children}
    </Text>
  ),
  a: (props: any) => (
    <Link
      color="#45a2f8"
      href={props.href}
      isExternal
      textDecoration="underline"
      _hover={{
        color: '#2589e6',
        textDecoration: 'none',
      }}
    >
      {props.children}
    </Link>
  ),
})

const ChatMessage: React.FC<ChatMessageProps & { mode: 'light' | 'dark' }> = ({
  message,
  isUser,
  txHash,
  explorerLink,
  containsQuote,
  onDownloadQuote,
  mode,
}) => (
  <Box w="full" py={4}>
    <Container maxW="container.md" px={0}>
      <Box color={isUser ? '#45a2f8' : mode === 'dark' ? 'white' : 'black'}>
        {isUser ? (
          <Text whiteSpace="pre-wrap">{message}</Text>
        ) : (
          <>
            <ReactMarkdown components={MarkdownComponents(mode)} remarkPlugins={[remarkGfm]}>
              {message}
            </ReactMarkdown>
            <HStack mt={3} spacing={2}>
              {txHash && explorerLink && (
                <Link href={explorerLink} isExternal color="#8c1c84" fontSize="sm">
                  <HStack spacing={1}>
                    <Text>
                      {txHash.slice(0, 6)}...{txHash.slice(-4)}
                    </Text>
                    <ExternalLinkIcon boxSize={3} />
                  </HStack>
                </Link>
              )}
              {containsQuote && onDownloadQuote && (
                <Button
                  size="sm"
                  colorScheme="blue"
                  leftIcon={<DownloadIcon />}
                  onClick={onDownloadQuote}
                  variant="outline"
                >
                  Télécharger PDF
                </Button>
              )}
            </HStack>
          </>
        )}
      </Box>
    </Container>
  </Box>
)

const QuoteModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  quoteData: any
  onDownload: () => void
  mode: 'light' | 'dark'
}> = ({ isOpen, onClose, quoteData, onDownload, mode }) => {
  if (!quoteData) return null

  const { devis } = quoteData

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent
        bg={mode === 'dark' ? 'gray.800' : 'white'}
        color={mode === 'dark' ? 'white' : 'black'}
      >
        <ModalHeader>
          <HStack>
            <Text>Devis Batappli IA Alpha</Text>
            <Badge colorScheme="blue">{devis.numero}</Badge>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Box>
              <Text fontWeight="bold" mb={2}>
                Informations du devis :
              </Text>
              <Text fontSize="sm">
                <strong>Entreprise :</strong> {devis.entreprise}
              </Text>
              <Text fontSize="sm">
                <strong>Date :</strong> {devis.date}
              </Text>
              <Text fontSize="sm">
                <strong>Validité :</strong> {devis.conditions.validite}
              </Text>
            </Box>

            <Divider />

            <Box>
              <Text fontWeight="bold" mb={2}>
                Articles :
              </Text>
              {devis.commande.articles.map((article: any, index: number) => (
                <Box
                  key={index}
                  p={3}
                  bg={mode === 'dark' ? 'gray.700' : 'gray.100'}
                  borderRadius="md"
                  mb={2}
                >
                  <Text fontWeight="semibold">{article.designation}</Text>
                  <Text fontSize="sm" color={mode === 'dark' ? 'gray.300' : 'gray.600'}>
                    Réf: {article.reference} | {article.quantite} {article.unite}
                  </Text>
                  <Text fontSize="sm">
                    {article.prix_unitaire}€ HT/unité × {article.quantite} = {article.montant_ht}€
                    HT
                  </Text>
                </Box>
              ))}
            </Box>

            <Divider />

            <Box>
              <Text fontWeight="bold" mb={2}>
                Total :
              </Text>
              <Text>Sous-total HT : {devis.commande.sous_total_ht}€</Text>
              <Text>
                TVA ({devis.commande.tva.taux}%) : {devis.commande.tva.montant}€
              </Text>
              <Text fontSize="lg" fontWeight="bold" color="green.300">
                Total TTC : {devis.commande.total_ttc}€
              </Text>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onDownload} leftIcon={<DownloadIcon />}>
            Télécharger PDF
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Fermer
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default function MenuiseriePage() {
  const toast = useToast()
  const { address } = useAppKitAccount()
  const { mode } = useTheme()

  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId, setSessionId] = useState<string>('')
  const [selectedModel, setSelectedModel] = useState<'anthropic' | 'mistral'>('mistral')
  const [currentQuoteData, setCurrentQuoteData] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)

  const { isOpen, onOpen, onClose } = useDisclosure()

  const scrollToBottom = useCallback(() => {
    if (initialLoadComplete && messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 50)
    }
  }, [initialLoadComplete])

  useEffect(() => {
    setMessages([
      {
        text: "Bonjour ! Je suis Marc, votre assistant spécialisé en menuiserie. Je suis là pour vous aider à éditer un devis.\n\nComment puis-je vous aider aujourd'hui ?",
        isUser: false,
      },
    ])

    const timer = setTimeout(() => {
      setInitialLoadComplete(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (initialLoadComplete && messages.length > 1) {
      scrollToBottom()
    }
  }, [messages, initialLoadComplete, scrollToBottom])

  const detectQuoteInResponse = (text: string): { containsQuote: boolean; quoteData: any } => {
    try {
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/)
      if (jsonMatch) {
        const jsonData = JSON.parse(jsonMatch[1])
        if (jsonData.devis) {
          return { containsQuote: true, quoteData: jsonData }
        }
      }
    } catch (error) {
      console.warn('Failed to parse quote JSON:', error)
    }
    return { containsQuote: false, quoteData: null }
  }

  const generatePDFFromQuote = (quoteData: any) => {
    try {
      const { devis } = quoteData

      const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Devis ${devis.numero}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; color: #333; }
    .header { text-align: center; border-bottom: 2px solid #0066cc; padding-bottom: 20px; margin-bottom: 30px; }
    .company-name { color: #0066cc; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
    .quote-number { color: #666; font-size: 18px; margin-top: 5px; }
    .section { margin: 25px 0; }
    .section-title { background: #f0f8ff; padding: 12px 15px; font-weight: bold; border-left: 4px solid #0066cc; margin-bottom: 15px; font-size: 16px; }
    .article { border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px; background: #fafafa; }
    .article-title { font-weight: bold; color: #333; margin-bottom: 8px; }
    .article-ref { color: #666; font-size: 14px; margin-bottom: 8px; }
    .price-line { display: flex; justify-content: space-between; margin: 5px 0; align-items: center; }
    .total-section { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 25px 0; border: 1px solid #e0e0e0; }
    .final-total { font-size: 20px; font-weight: bold; color: #0066cc; border-top: 2px solid #0066cc; padding-top: 15px; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-name">${devis.entreprise}</div>
    <div class="quote-number">Devis N° ${devis.numero}</div>
    <p><strong>Date :</strong> ${devis.date}</p>
  </div>

  <div class="section">
    <div class="section-title">Détail des Articles</div>
    ${devis.commande.articles
      .map(
        (article: any) => `
      <div class="article">
        <div class="article-title">${article.designation}</div>
        <div class="article-ref">Référence: ${article.reference}</div>
        <div class="price-line">
          <span>Quantité: <strong>${article.quantite} ${article.unite}</strong></span>
          <span>Prix unitaire: <strong>${article.prix_unitaire}€ HT</strong></span>
        </div>
        <div class="price-line">
          <span><strong>Total ligne:</strong></span>
          <span><strong>${article.montant_ht}€ HT</strong></span>
        </div>
      </div>
    `
      )
      .join('')}
  </div>

  <div class="total-section">
    <div class="price-line">
      <span><strong>Sous-total HT:</strong></span>
      <span><strong>${devis.commande.sous_total_ht}€</strong></span>
    </div>
    <div class="price-line">
      <span><strong>TVA (${devis.commande.tva.taux}%):</strong></span>
      <span><strong>${devis.commande.tva.montant}€</strong></span>
    </div>
    <div class="final-total">
      <div class="price-line">
        <span>TOTAL TTC:</span>
        <span>${devis.commande.total_ttc}€</span>
      </div>
    </div>
  </div>

  ${
    devis.options && devis.options.length > 0
      ? `
    <div class="section">
      <div class="section-title">Options Disponibles</div>
      ${devis.options
        .map(
          (option: any) => `
        <div style="margin: 10px 0; padding: 10px; background: #fff8dc; border-radius: 4px;">
          <div style="font-weight: bold;">${option.designation}</div>
          <div style="color: #0066cc;">${option.prix}</div>
          ${option.commentaire ? `<div style="color: #666; font-size: 13px;">${option.commentaire}</div>` : ''}
        </div>
      `
        )
        .join('')}
    </div>
  `
      : ''
  }

  <div style="margin-top: 40px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #e0e0e0; padding-top: 20px;">
    <p><strong>Devis généré par Batappli IA Alpha</strong></p>
    <p>Validité: ${devis.conditions.validite} | Acompte: ${devis.conditions.acompte}</p>
  </div>
</body>
</html>`

      const blob = new Blob([htmlContent], { type: 'text/html' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Devis_${devis.numero}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast({
        title: 'Devis téléchargé',
        description: `Le devis ${devis.numero} a été téléchargé`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      console.error('PDF generation error:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible de générer le PDF',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const handleQuoteDownload = (quoteData: any) => {
    setCurrentQuoteData(quoteData)
    onOpen()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!inputValue.trim() || isTyping) {
      return
    }

    const userMessage: Message = {
      text: inputValue,
      isUser: true,
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          context: 'batman',
          model: selectedModel,
          sessionId: sessionId || '',
          address: address || '',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }))

        if (response.status === 429) {
          const rateMessage: Message = {
            text: 'Désolée, vous avez atteint la limite de requêtes. Veuillez réessayer dans une heure.',
            isUser: false,
          }
          setMessages(prev => [...prev, rateMessage])
          return
        }

        throw new Error(errorData.message || `Erreur ${response.status}`)
      }

      const data: RukhResponse = await response.json()
      setSessionId(data.sessionId)

      const { containsQuote, quoteData } = detectQuoteInResponse(data.output)

      const assistantMessage: Message = {
        text: data.output,
        isUser: false,
        txHash: data.txHash,
        explorerLink: data.explorerLink,
        containsQuote,
        quoteData,
      }

      setMessages(prev => [...prev, assistantMessage])

      if (containsQuote && quoteData) {
        setTimeout(() => handleQuoteDownload(quoteData), 1000)
      }
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        text: 'Désolée, je rencontre un problème technique. Pouvez-vous réessayer ?',
        isUser: false,
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <Box
      minH="calc(100vh - 80px)"
      display="flex"
      flexDirection="column"
      bg={mode === 'dark' ? 'black' : 'white'}
      pt="40px"
    >
      <Box bg={mode === 'dark' ? 'blue.900' : '#FDD69D'} py={4} mb={4}>
        <Container maxW="container.md">
          <VStack spacing={3}>
            <Heading size="lg" color={mode === 'dark' ? 'white' : 'black'}>
              Batappli IA
            </Heading>
            <Text color={mode === 'dark' ? 'blue.100' : 'black'} textAlign="center" fontSize="sm">
              Corps de métier : <strong>menuiserie</strong>
            </Text>
          </VStack>
        </Container>
      </Box>

      <Box flex="1" overflowY="auto" px={4}>
        <Container maxW="container.md" h="full" px={0}>
          <VStack spacing={0} align="stretch">
            <FormControl maxW="200px">
              <FormLabel
                htmlFor="model-select"
                fontSize="xs"
                color={mode === 'dark' ? 'blue.200' : 'gray.600'}
                mb={1}
              >
                Modèle
              </FormLabel>
              <Select
                id="model-select"
                value={selectedModel}
                onChange={e => setSelectedModel(e.target.value as 'anthropic' | 'mistral')}
                size="sm"
                borderColor={mode === 'dark' ? 'blue.700' : 'gray.300'}
                bg={mode === 'dark' ? 'blue.800' : 'white'}
                color={mode === 'dark' ? 'white' : 'black'}
                _focus={{
                  borderColor: '#45a2f8',
                  boxShadow: 'none',
                }}
              >
                <option value="mistral">Mistral</option>
                <option value="anthropic">Anthropic (Claude)</option>
                <option value="openai" disabled>
                  OpenAI (ChatGPT)
                </option>
                <option value="gemini" disabled>
                  Google (Gemini)
                </option>
                <option value="llama" disabled>
                  Meta (Llama)
                </option>
                <option value="deepseek" disabled>
                  DeepSeek (DeepSeek v3.2)
                </option>
              </Select>
            </FormControl>
            {messages.map((message, index) => (
              <ChatMessage
                key={index}
                message={message.text}
                isUser={message.isUser}
                txHash={message.txHash}
                explorerLink={message.explorerLink}
                containsQuote={message.containsQuote}
                onDownloadQuote={
                  message.quoteData ? () => handleQuoteDownload(message.quoteData) : undefined
                }
                mode={mode}
              />
            ))}
            {isTyping && (
              <Box p={0}>
                <Container maxW="container.md" mx="auto">
                  <Image priority width="120" height="120" alt="loader" src="/loader.svg" />
                </Container>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </VStack>
        </Container>
      </Box>

      <Box as="form" onSubmit={handleSubmit} p={4} bg={mode === 'dark' ? 'gray.900' : 'gray.100'}>
        <Container maxW="container.md" mx="auto">
          <Flex gap={2}>
            <Input
              value={inputValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
              placeholder="Fais-moi un devis pour un parquet de 200 m² en chêne massif"
              size="lg"
              borderColor="gray.700"
              _placeholder={{
                color: 'gray.500',
              }}
              _focus={{
                borderColor: '#45a2f8',
                boxShadow: 'none',
              }}
            />
            <Button
              type="submit"
              size="lg"
              isDisabled={!inputValue.trim() || isTyping}
              bg="black"
              color="white"
              _hover={{
                bg: 'gray.800',
              }}
            >
              Envoyer
            </Button>
          </Flex>
        </Container>
      </Box>

      <QuoteModal
        isOpen={isOpen}
        onClose={onClose}
        quoteData={currentQuoteData}
        onDownload={() => {
          generatePDFFromQuote(currentQuoteData)
          onClose()
        }}
        mode={mode}
      />
    </Box>
  )
}
