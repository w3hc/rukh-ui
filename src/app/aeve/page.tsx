'use client'

import React, { useState, useRef } from 'react'
import {
  Container,
  Box,
  Button,
  VStack,
  Text,
  Heading,
  Textarea,
  useToast,
  FormControl,
  FormLabel,
  Input,
  Divider,
  Select,
  Flex,
} from '@chakra-ui/react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import remarkGfm from 'remark-gfm'
import { useAppKitAccount } from '@reown/appkit/react'
import { useTranslation } from '@/hooks/useTranslation'

const MarkdownComponents = {
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
    <Box as="ul" pl={6} my={4}>
      {props.children}
    </Box>
  ),
  ol: (props: any) => (
    <Box as="ol" pl={6} my={4}>
      {props.children}
    </Box>
  ),
  li: (props: any) => (
    <Box as="li" mb={2} ml={0} display="list-item">
      {props.children}
    </Box>
  ),
  blockquote: (props: any) => (
    <Box borderLeftWidth="4px" borderLeftColor="gray.200" pl={4} py={2} my={4}>
      {props.children}
    </Box>
  ),
  code: ({ inline, className, children }: any) => {
    const match = /language-(\w+)/.exec(className || '')
    const language = match ? match[1] : ''

    if (inline) {
      return (
        <Text as="code" px={1} bg="gray.700" borderRadius="sm" fontSize="0.875em">
          {children}
        </Text>
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
    <Text
      as="a"
      color="#45a2f8"
      href={props.href}
      textDecoration="underline"
      _hover={{
        color: '#2589e6',
        textDecoration: 'none',
      }}
      onClick={e => {
        if (!props.href || props.href === '#') {
          e.preventDefault()
          return
        }
      }}
    >
      {props.children}
    </Text>
  ),
}

export default function AevePage() {
  const toast = useToast()
  const { address } = useAppKitAccount()
  const t = useTranslation()

  const [jobDescription, setJobDescription] = useState('')
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [resumeContent, setResumeContent] = useState('')
  const [coverLetter, setCoverLetter] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingGenerate, setIsLoadingGenerate] = useState(false)
  const [sessionId, setSessionId] = useState<string>('')
  const [selectedLanguage, setSelectedLanguage] = useState('english')
  const [fileProcessingError, setFileProcessingError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [personalReasons, setPersonalReasons] = useState('')

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileProcessingError('')

    // For text-based files like TXT, MD, etc.
    if (file.type === 'text/plain' || file.type === 'text/markdown' || file.name.endsWith('.md')) {
      const reader = new FileReader()
      reader.onload = async e => {
        const text = e.target?.result
        if (typeof text === 'string') {
          setResumeContent(text)
        }
      }
      reader.readAsText(file)
      return
    }

    // For PDF files
    if (file.type === 'application/pdf') {
      setIsLoading(true)

      // Create FormData object
      const formData = new FormData()
      formData.append('file', file)

      try {
        // Send PDF to a serverless function for conversion
        const response = await fetch('/api/convert-pdf', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Failed to convert PDF file')
        }

        const data = await response.json()
        setResumeContent(data.text)
      } catch (error) {
        console.error('Error converting PDF:', error)
        setFileProcessingError(
          'Could not process PDF file. Please try uploading a text-based resume.'
        )
        toast({
          title: 'File Processing Error',
          description: 'Could not convert the PDF. Please try a text format instead.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      } finally {
        setIsLoading(false)
      }
      return
    }

    // For unsupported file types
    setFileProcessingError('Unsupported file format. Please upload a PDF, TXT, or MD file.')
    toast({
      title: 'Unsupported File',
      description: 'Please upload a PDF, TXT, or MD file.',
      status: 'warning',
      duration: 5000,
      isClosable: true,
    })
  }

  const handleGenerateCoverLetter = async () => {
    if (!jobDescription.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please provide the job description',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      return
    }

    setIsLoadingGenerate(true)
    setCoverLetter('')

    try {
      // Prepare message for the API
      const message = `
        # User Information
        Name: ${name || 'Not provided'}
        Age: ${age || 'Not provided'}
        Preferred Language: ${selectedLanguage}

        # Resume Content
        ${resumeContent || 'No resume uploaded'}

        # Job Description
        ${jobDescription}

        # Personal Motivation
        ${personalReasons || 'Not provided'}

        # Task
        Please generate a concise cover letter for this job application based on the provided information.
        Write the cover letter in ${selectedLanguage}.
        Incorporate the personal motivation if provided to make the letter more authentic and personalized.
        If the user requested bullet points, ensure they are properly formatted with a proper line break before each bullet point and a blank line after the last bullet point.
        `.trim()

      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          context: 'aeve',
          sessionId: sessionId || '',
          address: address || '',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `API error: ${response.status}`)
      }

      const data = await response.json()
      setSessionId(data.sessionId)
      setCoverLetter(data.output)

      // Add smooth scrolling to the result section
      setTimeout(() => {
        const resultElement = document.getElementById('cover-letter-result')
        if (resultElement) {
          resultElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 300) // Small delay to ensure the UI has updated
    } catch (error) {
      console.error('Error generating cover letter:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate cover letter',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoadingGenerate(false)
    }
  }

  return (
    <Box minH="calc(100vh - 80px)" display="flex" flexDirection="column" bg="black" pt="60px">
      <Container maxW="container.md" py={8}>
        <VStack spacing={6} align="stretch">
          <Heading as="h1" size="xl" mb={4} textAlign="center">
            Cover Letter Generator
          </Heading>

          <Text>
            Generate a personalized cover letter based on your resume and the job description.
          </Text>

          <Box bg="gray.900" p={5} borderRadius="md">
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Your Name (Optional)</FormLabel>
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="John Doe"
                  bg="gray.800"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Your Age (Optional)</FormLabel>
                <Select
                  placeholder="Select age range"
                  value={age}
                  onChange={e => setAge(e.target.value)}
                  bg="gray.800"
                >
                  <option value="18-24">18-24</option>
                  <option value="25-34">25-34</option>
                  <option value="35-44">35-44</option>
                  <option value="45-54">45-54</option>
                  <option value="55+">55+</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Preferred Language</FormLabel>
                <Select
                  value={selectedLanguage}
                  onChange={e => setSelectedLanguage(e.target.value)}
                  bg="gray.800"
                >
                  <option value="english">English</option>
                  <option value="french">French</option>
                  <option value="spanish">Spanish</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>
                  Using your own words, what are the REAL reasons you want to work there? (optional)
                </FormLabel>
                <Textarea
                  value={personalReasons}
                  onChange={e => setPersonalReasons(e.target.value)}
                  placeholder="I'm excited about this company because..."
                  size="md"
                  minHeight="100px"
                  bg="gray.800"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Upload Resume (Optional)</FormLabel>
                <Input
                  type="file"
                  accept=".txt,.pdf,.md"
                  onChange={handleResumeUpload}
                  ref={fileInputRef}
                  display="none"
                />
                <Flex direction="column" gap={2}>
                  <Flex>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      bg="gray.700"
                      _hover={{ bg: 'gray.600' }}
                      flex="1"
                      isLoading={isLoading && !coverLetter}
                    >
                      Choose File
                    </Button>
                    {resumeContent && !fileProcessingError && (
                      <Text ml={4} color="green.300" alignSelf="center">
                        Resume uploaded ✓
                      </Text>
                    )}
                  </Flex>
                  {fileProcessingError && (
                    <Text color="red.300" fontSize="sm">
                      {fileProcessingError}
                    </Text>
                  )}
                  <Text fontSize="xs" color="gray.400">
                    Supported formats: PDF, TXT, MD (PDF files will be converted to text)
                  </Text>
                </Flex>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Job Description</FormLabel>
                <Textarea
                  value={jobDescription}
                  onChange={e => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here..."
                  size="md"
                  minHeight="200px"
                  bg="gray.800"
                />
              </FormControl>

              <Button
                onClick={handleGenerateCoverLetter}
                isLoading={isLoadingGenerate}
                loadingText="Generating..."
                colorScheme="blue"
                bg="#45a2f8"
                color="white"
                _hover={{
                  bg: '#2589e6',
                }}
                size="lg"
                isDisabled={!jobDescription.trim()}
              >
                Generate Cover Letter
              </Button>
            </VStack>
          </Box>

          {coverLetter && (
            <Box bg="gray.900" p={5} borderRadius="md" mt={6} id="cover-letter-result">
              <Heading as="h2" size="md" mb={4}>
                Your Cover Letter
              </Heading>
              <Divider mb={4} />
              <Box
                bg="gray.800"
                p={4}
                borderRadius="md"
                whiteSpace="pre-wrap"
                sx={{
                  ul: {
                    paddingLeft: '1.5rem',
                    marginY: '1rem',
                  },
                  li: {
                    marginBottom: '0.5rem',
                    display: 'list-item',
                  },
                  'li > p': {
                    display: 'inline',
                    marginY: 0,
                  },
                }}
              >
                <ReactMarkdown components={MarkdownComponents} remarkPlugins={[remarkGfm]}>
                  {coverLetter}
                </ReactMarkdown>
              </Box>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(coverLetter)
                  toast({
                    title: 'Copied to clipboard',
                    status: 'success',
                    duration: 2000,
                    isClosable: true,
                  })
                }}
                mt={4}
                colorScheme="teal"
              >
                Copy to Clipboard
              </Button>
            </Box>
          )}
        </VStack>
      </Container>
    </Box>
  )
}
