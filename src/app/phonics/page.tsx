'use client'

import { useState, useEffect, useRef } from 'react'
import { Box, Button, VStack, Text, Heading, Flex, Spinner, IconButton } from '@chakra-ui/react'
import { FaVolumeUp } from 'react-icons/fa'
import Link from 'next/link'
import { useText } from '../TextContext'

interface WordData {
  word: string;
  phonetic: string;
  audio_url: string | null;
}

const Phonics = () => {
  const { inputText } = useText()
  const [words, setWords] = useState<WordData[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const fetchWordData = async () => {
      if (inputText) {
        setLoading(true)
        try {
          const response = await fetch('/api/phonetics', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: inputText }),
          })
          if (!response.ok) {
            throw new Error('Failed to fetch word data')
          }
          const data = await response.json()
          setWords(data)
        } catch (error) {
          console.error('Error fetching word data:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    fetchWordData()
  }, [inputText])

  const playAudio = async () => {
    const currentWord = words[currentIndex]
    if (currentWord.audio_url && audioRef.current) {
      audioRef.current.src = currentWord.audio_url
      try {
        await audioRef.current.play()
      } catch (error) {
        console.error('Error playing audio:', error)
      }
    }
  }

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
          <Heading as="h1" size="2xl" textAlign="center">Word Phonetics</Heading>
          <Text textAlign="center">No words available. Please enter some text with less common words on the home page.</Text>
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
        <Heading as="h1" size="2xl" textAlign="center">Word Phonetics</Heading>
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
                {words[currentIndex].phonetic}
              </Text>
              {words[currentIndex].audio_url && (
                <IconButton
                  aria-label="Play pronunciation"
                  icon={<FaVolumeUp />}
                  onClick={playAudio}
                  colorScheme="blue"
                  size="lg"
                  isRound
                />
              )}
            </VStack>
            <audio ref={audioRef} />
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
