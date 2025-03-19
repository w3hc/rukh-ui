import { NextRequest, NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { randomUUID } from 'crypto'

// Convert PDF content to markdown format using pdf2json
async function convertPdfToMarkdown(pdfBuffer: ArrayBuffer, fileName: string): Promise<string> {
  try {
    // Import pdf2json dynamically
    const PDF2Json = (await import('pdf2json')).default

    // Create a temporary file to store the PDF data
    // (pdf2json requires a file path rather than buffer)
    const tempDir = path.join(os.tmpdir(), 'pdf-extracts')

    // Create the temp directory if it doesn't exist
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    const tempFilePath = path.join(tempDir, `${randomUUID()}.pdf`)

    // Convert ArrayBuffer to Uint8Array for writing to file
    const pdfData = new Uint8Array(pdfBuffer)
    fs.writeFileSync(tempFilePath, pdfData)

    // Create a new instance of the parser
    const pdfParser = new PDF2Json()

    // Set up promise-based parsing
    const parsePromise = new Promise<string>((resolve, reject) => {
      pdfParser.on('pdfParser_dataError', (errData: any) => {
        reject(new Error(errData.parserError || 'PDF parsing error'))
      })

      pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
        try {
          // Extract text from each page
          let textContent = ''

          // Get the total number of pages
          const numPages = pdfData.Pages?.length || 0

          for (const page of pdfData.Pages || []) {
            const pageTexts = page.Texts || []

            for (const text of pageTexts) {
              // Decode the text (pdf2json encodes spaces as '%20' etc.)
              const decodedText = decodeURIComponent(text.R.map((t: any) => t.T).join(' ')) + ' '
              textContent += decodedText
            }

            textContent += '\n\n' // Add two newlines between pages
          }

          // Clean up the temporary file
          try {
            fs.unlinkSync(tempFilePath)
          } catch (cleanupError) {
            console.warn('Could not clean up temporary file:', cleanupError)
          }

          // Convert the extracted text to structured markdown
          const markdown = formatPdfTextToMarkdown(textContent, fileName, numPages)
          resolve(markdown)
        } catch (error) {
          reject(error)
        }
      })

      // Start the parsing process
      pdfParser.loadPDF(tempFilePath)
    })

    return await parsePromise
  } catch (error) {
    console.error('Error in PDF extraction:', error)
    return createFallbackMarkdown(pdfBuffer, fileName)
  }
}

// Format extracted PDF text into markdown structure
function formatPdfTextToMarkdown(text: string, fileName: string, numPages: number): string {
  // Clean up and normalize the text
  let cleanText = text
    .replace(/(\r\n|\r)/gm, '\n') // Normalize line endings
    .replace(/\n{3,}/g, '\n\n') // Remove excessive newlines
    .replace(/\s{2,}/g, ' ') // Remove excessive spaces
    .trim()

  // Extract potential sections from the text
  const lines = cleanText.split('\n')
  let sections: { [key: string]: string[] } = {
    Contact: [],
    Experience: [],
    Education: [],
    Skills: [],
    Other: [],
  }

  let currentSection = 'Contact'

  // Process the text line by line to identify sections
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // Skip empty lines
    if (!line) continue

    // Try to identify section headers
    const uppercaseLine = line.toUpperCase()

    if (line.length > 3 && line.length < 50) {
      // Look for section headers based on keywords
      if (
        uppercaseLine.includes('EXPÉRIENCE') ||
        uppercaseLine.includes('EXPERIENCE') ||
        uppercaseLine.includes('PARCOURS') ||
        uppercaseLine.includes('PROFESSIONNEL')
      ) {
        currentSection = 'Experience'
        continue
      } else if (
        uppercaseLine.includes('ÉDUCATION') ||
        uppercaseLine.includes('EDUCATION') ||
        uppercaseLine.includes('FORMATION') ||
        uppercaseLine.includes('DIPLÔME') ||
        uppercaseLine.includes('DIPLOME')
      ) {
        currentSection = 'Education'
        continue
      } else if (
        uppercaseLine.includes('COMPÉTENCE') ||
        uppercaseLine.includes('COMPETENCE') ||
        uppercaseLine.includes('SKILL') ||
        uppercaseLine.includes('TECHNO') ||
        uppercaseLine.includes('TECHNIQUE')
      ) {
        currentSection = 'Skills'
        continue
      } else if (
        uppercaseLine.includes('CONTACT') ||
        uppercaseLine.includes('PROFIL') ||
        (line.includes('@') && line.length < 40)
      ) {
        currentSection = 'Contact'
        continue
      }
    }

    // Check for email pattern anywhere in the line
    if (
      currentSection === 'Contact' &&
      /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/.test(line)
    ) {
      sections[currentSection].push(line)
      continue
    }

    // Add the line to the current section
    sections[currentSection].push(line)
  }

  // Convert sections to markdown
  let markdown = `# Resume: ${fileName}\n\n`

  // Add a note about the extraction
  markdown += `*PDF document with ${numPages} page${numPages > 1 ? 's' : ''} successfully extracted.*\n\n`

  for (const [section, content] of Object.entries(sections)) {
    if (content.length > 0) {
      markdown += `## ${section}\n`

      // Format content based on section type
      if (section === 'Skills') {
        // Try to identify individual skills and convert to bullet points
        const fullText = content.join(' ')
        const possibleSkills = fullText
          .split(/[,•|\/]/)
          .map(s => s.trim())
          .filter(Boolean)

        if (possibleSkills.length > 1) {
          // If we can identify separate skills, format as bullet points
          markdown += possibleSkills.map(skill => `- ${skill}`).join('\n')
        } else {
          // Otherwise, just keep the original text
          markdown += content.join('\n')
        }
      } else if (section === 'Experience' || section === 'Education') {
        // Look for date patterns and job titles to structure experiences/education
        let formattedContent = ''
        let inEntry = false

        for (const line of content) {
          // Check for date patterns like "2018-2020" or "Jan 2018 - Dec 2020"
          const hasDatePattern =
            /\b(19|20)\d{2}\s*[-–—]\s*(19|20)\d{2}|présent|present|actuel|current|now\b/i.test(line)

          if (hasDatePattern) {
            if (inEntry) {
              formattedContent += '\n\n'
            }
            formattedContent += `### ${line}\n`
            inEntry = true
          } else if (inEntry) {
            formattedContent += `${line}\n`
          } else {
            formattedContent += `${line}\n`
          }
        }

        markdown += formattedContent
      } else {
        // For other sections, preserve the structure
        markdown += content.join('\n')
      }

      markdown += '\n\n'
    }
  }

  return markdown
}

// Create a placeholder markdown when PDF parsing fails
function createFallbackMarkdown(pdfBuffer: ArrayBuffer, fileName: string): string {
  return `# Resume: ${fileName}

## Note
Your PDF resume was received (${Math.round(pdfBuffer.byteLength / 1024)} KB) but could not be fully parsed. 
The cover letter will be generated based on the information you provide in the job description.

For better results, consider providing key resume highlights in your job description field,
or uploading your resume in text (.txt) or markdown (.md) format.
`
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ message: 'No file provided' }, { status: 400 })
    }

    // Check if the file is a PDF
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { message: 'Unsupported file type. Only PDF files are supported.' },
        { status: 400 }
      )
    }

    // Get the file buffer
    const buffer = await file.arrayBuffer()

    try {
      // Convert the PDF to markdown
      const markdownContent = await convertPdfToMarkdown(buffer, file.name)

      return NextResponse.json({
        text: markdownContent,
        message: 'PDF processed and converted to markdown successfully',
      })
    } catch (extractionError) {
      console.error('PDF extraction failed:', extractionError)

      // Fall back to basic markdown
      const fallbackContent = createFallbackMarkdown(buffer, file.name)

      return NextResponse.json({
        text: fallbackContent,
        message: 'PDF received but could not be fully processed',
      })
    }
  } catch (error) {
    console.error('Error processing PDF:', error)
    return NextResponse.json(
      {
        message: 'Failed to process PDF file',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
