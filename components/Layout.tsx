import { Box, Container, Heading } from '@chakra-ui/react'
import { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <Box minHeight="100vh" bg="gray.50">
      <Container maxW="container.xl" py={8}>
        <Heading as="h1" size="2xl" mb={8} color="brand.500">
          CallHacks 11.0
        </Heading>
        {children}
      </Container>
    </Box>
  )
}
