'use client'

import { Box, Container, Heading, Text, VStack, Button } from "@chakra-ui/react";
import Link from "next/link";
import Image from 'next/image';
import { FaHome } from 'react-icons/fa';

export default function NotFound() {
  return (
    <Box 
      minHeight="100vh" 
      display="flex"
      flexDirection="column"
      backgroundImage="radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.05) 1px, transparent 0)"
      backgroundSize="40px 40px"
      position="relative"
    >
      <Container maxW="container.lg" flex="1" pt={8}>
        <VStack spacing={8}>
          <Link href="/" passHref>
            <Heading 
              as="h1" 
              size="2xl" 
              textAlign="center"
              bgGradient="linear(to-r, blue.400, purple.500, pink.500)"
              bgClip="text"
              fontWeight="extrabold"
              letterSpacing="tight"
              _hover={{
                bgGradient: "linear(to-r, blue.500, purple.600, pink.600)",
                cursor: "pointer",
                transform: "translateY(-2px)"
              }}
              transition="all 0.3s ease"
              mb={4}
            >
              Read On
            </Heading>
          </Link>
          <Text 
            fontSize="xl" 
            textAlign="center" 
            maxWidth="800px" 
            mx="auto"
            color="gray.600"
            lineHeight="tall"
          >
            Your AI-Powered Reading Companion
          </Text>
        </VStack>

        <VStack 
          spacing={6}
          justify="center" 
          align="center" 
          flex="1"
          minH="50vh"
          mt={16}
        >
          <Box 
            position="relative" 
            width="200px" 
            height="200px"
          >
            <Image
              src="/caterpillar.png"
              alt="Bookworm Mascot"
              width={200}
              height={200}
              style={{ objectFit: 'contain' }}
              priority
            />
          </Box>
          <VStack spacing={2}>
            <Text
              fontSize="2xl"
              fontWeight="bold"
              color="blue.600"
              textAlign="center"
            >
              Oops! Looks like you read too far 😅
            </Text>
            <Text
              fontSize="xl"
              color="gray.600"
              textAlign="center"
            >
              This page does not exist.
            </Text>
          </VStack>
        </VStack>
      </Container>

      <Box
        py={4}
        bgGradient="linear(to-r, blue.500, purple.600)"
        borderTop="1px"
        borderColor="blue.300"
        backdropFilter="blur(8px)"
        boxShadow="0 -4px 6px -1px rgba(0, 0, 0, 0.1)"
      >
        <Container maxW="container.xl">
          <VStack spacing={2}>
            <Link href="/" passHref>
              <Button
                leftIcon={<FaHome />}
                variant="ghost"
                color="white"
                size="lg"
                _hover={{
                  bg: "whiteAlpha.200",
                  transform: "translateY(-2px)"
                }}
                transition="all 0.2s"
              >
                Back to Home
              </Button>
            </Link>
            <Text 
              textAlign="center" 
              fontSize="sm" 
              color="white"
              fontWeight="medium"
            >
              © {new Date().getFullYear()} Read On. Created by Aadhil Mubarak Syed. All rights reserved.
            </Text>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
} 