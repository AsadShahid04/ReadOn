"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  Button,
  Textarea,
  useColorModeValue,
  Container,
  Fade,
  SimpleGrid,
  HStack,
} from "@chakra-ui/react";
import Link from "next/link";
import { useText } from "./TextContext";

const CHARACTER_LIMIT = 3500;

interface FeatureButtonProps {
  href: string;
  title: string;
  description: string;
}

const FeatureButton: React.FC<FeatureButtonProps> = ({
  href,
  title,
  description,
}) => (
  <Link href={href} passHref>
    <Button
      as="div"
      height="auto"
      p={6}
      colorScheme="blue"
      variant="outline"
      width="100%"
      minH="150px"
      cursor="pointer"
    >
      <VStack align="center" spacing={2}>
        <Text fontSize="xl" fontWeight="bold" textAlign="center">
          {title}
        </Text>
        <Text fontSize="sm" textAlign="center">
          {description}
        </Text>
      </VStack>
    </Button>
  </Link>
);

export default function Home() {
  const { inputText, setInputText } = useText();
  const [mounted, setMounted] = useState(false);
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const textareaBg = useColorModeValue("white", "gray.700");
  const errorColor = useColorModeValue("red.500", "red.300");

  const isOverLimit = inputText.length > CHARACTER_LIMIT;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(event.target.value);
  };

  return (
    <Box minHeight="100vh" py={16} px={8} bg={bgColor} color={textColor}>
      <Container maxW="container.xl">
        <VStack spacing={12} align="stretch">
          <Fade in={true}>
            <VStack spacing={6}>
              <Heading as="h1" size="2xl" textAlign="center">
                Read On
              </Heading>
              <Text fontSize="xl" textAlign="center" maxWidth="800px" mx="auto">
                Your AI-powered reading companion designed to enhance
                comprehension, improve phonics skills, and visualize text
                relationships.
              </Text>
            </VStack>
          </Fade>

          {/* Text Input Section */}
          <VStack spacing={2} width="100%">
            <Text fontSize="lg" fontWeight="medium">
              Enter Your Text Here
            </Text>
            <Textarea
              placeholder="Type or paste your text here..."
              size="lg"
              value={inputText}
              onChange={handleInputChange}
              bg={textareaBg}
              minHeight="200px"
              resize="vertical"
              width="100%"
              borderColor={isOverLimit ? "red.500" : undefined}
              _hover={{
                borderColor: isOverLimit ? "red.600" : undefined,
              }}
              _focus={{
                borderColor: isOverLimit ? "red.700" : undefined,
                boxShadow: isOverLimit ? `0 0 0 1px ${errorColor}` : undefined,
              }}
            />
            {mounted && (
              <HStack spacing={2} alignSelf="flex-end">
                <Text
                  fontSize="sm"
                  color={isOverLimit ? "red.500" : "gray.500"}
                >
                  ({inputText.length}/{CHARACTER_LIMIT} characters)
                </Text>
                {isOverLimit && (
                  <Text fontSize="sm" color="red.500" fontWeight="medium">
                    You have exceeded the character limit
                  </Text>
                )}
              </HStack>
            )}
          </VStack>

          {/* Features Section in 2x2 Grid */}
          <VStack spacing={6} width="100%">
            <Text fontSize="lg" fontWeight="medium">
              Choose an Option to Begin
            </Text>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} width="100%">
              <FeatureButton
                href="/phonics"
                title="Phonics Practice"
                description="Enhance phonetic awareness and word-building skills"
              />
              <FeatureButton
                href="/comprehension"
                title="Reading Comprehension"
                description="Analyze texts and improve understanding of written content"
              />
              <FeatureButton
                href="/visualization"
                title="Word Visualization"
                description="Explore visual representations of words and their relationships"
              />
              <FeatureButton
                href="/audiobook"
                title="Read Aloud"
                description="Listen to your text being read aloud"
              />
            </SimpleGrid>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
}
