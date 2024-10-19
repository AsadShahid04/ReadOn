import { Box, Container, Heading } from '@chakra-ui/react'

export default function Layout({ children }) {
  return (
    <Box minHeight="100vh" bg="gray.50">
      <Container maxW="container.xl" py={8}>
        <Heading as="h1" size="2xl" mb={8} color="brand.500">
          ReadOn
        </Heading>
        {children}
      </Container>
    </Box>
  )
}
