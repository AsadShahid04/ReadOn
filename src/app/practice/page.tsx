'use client'

import { Box, Heading, Text, VStack } from '@chakra-ui/react'
import { useRouter } from 'next/router'

const Practice = () => {
  const router = useRouter();
  const { text } = router.query;

  return (
    <Box minHeight="100vh" py={16} px={8}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="2xl" textAlign="center">Practice Text</Heading>
        <Text fontSize="xl" textAlign="center">
          {text ? text : "No text provided for practice."}
        </Text>
      </VStack>
    </Box>
  )
}

export default Practice;
