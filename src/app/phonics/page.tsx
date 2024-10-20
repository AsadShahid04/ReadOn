'use client'

import { useState, useEffect } from 'react'
import { Box, Button, VStack, Text, Heading, Flex, Spinner } from '@chakra-ui/react'
import Link from 'next/link'
import { useText } from '../TextContext'

interface WordData {
  word: string;
  syllables: string;
}

const Phonics = () => {
  const { inputText } = useText()
  const [words, setWords] = useState<WordData[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchSyllablesForWords = async () => {
      if (inputText) {
        setLoading(true)
        try {
          const response = await fetch('/phonics/api', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: inputText }),
          })
          if (!response.ok) {
            throw new Error('Failed to fetch syllables')
          }
          const data = await response.json()
          setWords(data)
        } catch (error) {
          console.error('Error fetching syllables:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchSyllablesForWords()
  }, [inputText])

  const nextWord = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length)
  }

  const prevWord = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + words.length) % words.length)
  }

  if (loading) {
    return (
      <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" />
      </Box>
    )
  }

  if (words.length === 0) {
    return (
      <Box minHeight="100vh" py={16} px={8}>
        <VStack spacing={8} align="stretch">
          <Heading as="h1" size="2xl" textAlign="center">Word Syllables</Heading>
          <Text textAlign="center">No uncommon words available. Please enter some text with less common words on the home page.</Text>
          <Link href="/" passHref>
            <Button as="a" colorScheme="blue">Back to Home</Button>
          </Link>
        </VStack>
      </Box>
    )
  }

  return (
    <Box minHeight="100vh" py={16} px={8}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="2xl" textAlign="center">Word Syllables</Heading>
        <Box 
          bg="white" 
          p={12} 
          borderRadius="xl" 
          boxShadow="xl" 
          maxWidth="800px" 
          width="100%" 
          height="500px" 
          margin="auto"
        >
          <VStack spacing={8} align="stretch" height="100%" justify="space-between">
            <VStack>
              <Text fontSize="6xl" fontWeight="bold" textAlign="center">
                {words[currentIndex].word}
              </Text>
              <Text fontSize="3xl" textAlign="center" color="gray.600">
                {words[currentIndex].syllables}
              </Text>
            </VStack>
            <Flex justify="space-between">
              <Button onClick={prevWord} colorScheme="purple" size="lg" fontSize="xl">
                ← Previous
              </Button>
              <Button onClick={nextWord} colorScheme="purple" size="lg" fontSize="xl">
                Next →
              </Button>
            </Flex>
          </VStack>
        </Box>
        <Text textAlign="center" fontSize="xl">
          Word {currentIndex + 1} of {words.length}
        </Text>
        <Link href="/" passHref>
          <Button as="a" colorScheme="blue" size="lg">Back to Home</Button>
        </Link>
      </VStack>
    </Box>
  )
}

export default Phonics
