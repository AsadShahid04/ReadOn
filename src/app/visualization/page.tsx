'use client'

import { Box, Heading, Text, VStack, Button } from '@chakra-ui/react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

const WordVisualization = () => {
  const [inputText, setInputText] = useState('')
  const searchParams = useSearchParams()

  useEffect(() => {
    const text = searchParams.get('text')
    if (text) {
      setInputText(text)
    }
  }, [searchParams])

  return (
    <Box minHeight="100vh" py={16} px={8}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="2xl" textAlign="center">Word Visualization</Heading>
        <Text fontSize="xl" textAlign="center">
          This page will visualize words and their relationships from your input text.
        </Text>
        {inputText && (
          <Text fontSize="lg" textAlign="center">
            Your input text: {inputText}
          </Text>
        )}
        {/* Add your word visualization component here */}
        <Link href="/" passHref>
          <Button as="a" colorScheme="blue">Back to Home</Button>
        </Link>
      </VStack>
    </Box>
  )
}

export default WordVisualization
