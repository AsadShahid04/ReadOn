'use client'

import { Box, Heading, Text, VStack, Image, Spinner } from '@chakra-ui/react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface VisualizationResult {
  sentence: string;
  image_data: string;
}

const WordVisualization = () => {
  const [inputText, setInputText] = useState('')
  const [results, setResults] = useState<VisualizationResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    const text = searchParams.get('text')
    if (text) {
      setInputText(text)
      generateImages(text)
    }
  }, [searchParams])

  const generateImages = async (text: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/visualization/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      })
      const data = await response.json()
      if (response.ok) {
        setResults(data.results)
      } else {
        throw new Error(data.error || 'An error occurred')
      }
    } catch (error) {
      console.error('Error generating images:', error)
      setError(error instanceof Error ? error.message : 'An unknown error occurred')
    }
    setLoading(false)
  }

  return (
    <Box minHeight="100vh" py={16} px={8}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="2xl" textAlign="center">Word Visualization</Heading>
        {loading ? (
          <VStack spacing={4}>
            <Spinner size="xl" />
            <Text textAlign="center">Generating visualizations...</Text>
            <Text textAlign="center">This may take a few minutes.</Text>
          </VStack>
        ) : error ? (
          <Text color="red.500" textAlign="center">{error}</Text>
        ) : results.length > 0 ? (
          results.map((result, index) => (
            <Box key={index} borderWidth={1} borderRadius="lg" p={4}>
              <Text fontSize="lg" mb={4}><strong>Sentence:</strong> {result.sentence}</Text>
              <Image src={result.image_data} alt={result.sentence} />
            </Box>
          ))
        ) : (
          <Text textAlign="center">No results generated. Please try again.</Text>
        )}
      </VStack>
    </Box>
  )
}

export default WordVisualization
