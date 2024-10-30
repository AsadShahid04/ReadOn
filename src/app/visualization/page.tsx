'use client'

import { Box, Heading, Text, VStack, Image, Spinner, Button } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useText } from '../TextContext'  // Import the useText hook
import Link from 'next/link'

interface VisualizationResult {
  segment: string;
  image_data: string;
  segment_type: 'paragraph' | 'sentence';
}

const WordVisualization = () => {
  const { inputText } = useText()  // Use the useText hook to get the inputText
  const [results, setResults] = useState<VisualizationResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (inputText) {
      generateImages(inputText)
    }
  }, [inputText])  // Run this effect when inputText changes

  const generateImages = async (text: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/visualization', {  // Updated API route
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      })
      const data = await response.json()
      if (response.ok) {
        setResults(data.results)  // Updated to access results from the new response structure
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
        <Heading as="h1" size="2xl" textAlign="center">Text Visualization</Heading>
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
              <Text fontSize="lg" mb={4}>
                <strong>{result.segment_type.charAt(0).toUpperCase() + result.segment_type.slice(1)}:</strong> {result.segment}
              </Text>
              <Image src={result.image_data} alt={result.segment} />
            </Box>
          ))
        ) : (
          <Text textAlign="center">No results generated. Please try again.</Text>
        )}
        <Link href="/" passHref>
          <Button as="a" colorScheme="blue">
            Back to Home
          </Button>
        </Link>
      </VStack>
    </Box>
  )
}

export default WordVisualization
