'use client'

import { Box, Heading, Text, VStack, Button } from '@chakra-ui/react'
import Link from 'next/link'

const InteractiveLearning = () => {
  return (
    <Box minHeight="100vh" py={16} px={8}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="2xl" textAlign="center">Interactive Learning</Heading>
        <Text fontSize="xl" textAlign="center">
          This page will visualize words to help users connect sounds with images.
        </Text>
        <Link href="/" passHref>
          <Button as="a" colorScheme="blue">Back to Home</Button>
        </Link>
      </VStack>
    </Box>
  )
}

export default InteractiveLearning
