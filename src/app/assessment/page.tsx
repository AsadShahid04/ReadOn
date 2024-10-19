'use client'

import { Box, Heading, Text, VStack, Button } from '@chakra-ui/react'
import Link from 'next/link'

const AssessmentTools = () => {
  return (
    <Box minHeight="100vh" py={16} px={8}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="2xl" textAlign="center">Assessment Tools</Heading>
        <Text fontSize="xl" textAlign="center">
          This page will include comprehensive questions to evaluate understanding.
        </Text>
        <Link href="/" passHref>
          <Button as="a" colorScheme="blue">Back to Home</Button>
        </Link>
      </VStack>
    </Box>
  )
}

export default AssessmentTools
