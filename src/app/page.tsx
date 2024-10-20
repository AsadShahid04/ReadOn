"use client";

import { useState } from "react";
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
} from "@chakra-ui/react";
import Link from "next/link";
import { useText } from "./TextContext";

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
  <Link href={href} passHref style={{ width: "100%" }}>
    <Button
      as="a"
      height="auto"
      p={6}
      colorScheme="blue"
      variant="outline"
      width="100%"
    >
      <VStack align="center" spacing={2} width="100%">
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
  const [isSubmitted, setIsSubmitted] = useState(false);
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const textareaBg = useColorModeValue("white", "gray.700");

  const handleSubmit = () => {
    if (inputText.trim()) {
      setIsSubmitted(true);
    }
  };

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
                relationships. Utilizing advanced AI technology, Read On offers
                personalized learning experiences to boost your reading
                proficiency across various domains.
              </Text>
            </VStack>
          </Fade>

          {!isSubmitted ? (
            <VStack spacing={6}>
              <Text fontSize="lg" fontWeight="medium">
                Enter Some Text Here to Get Started
              </Text>
              <Textarea
                placeholder="Type or paste your text here..."
                size="lg"
                value={inputText}
                onChange={handleInputChange}
                bg={textareaBg}
                minHeight="200px"
              />
              <Button colorScheme="blue" size="lg" onClick={handleSubmit}>
                Submit
              </Button>
            </VStack>
          ) : (
            <Fade in={true}>
              <VStack spacing={8} width="100%" align="stretch">
                <Text fontSize="lg" fontWeight="medium" textAlign="center">
                  Choose an Option Below to Begin Your Reading Journey
                </Text>
                <VStack spacing={4} width="100%" maxWidth="600px" mx="auto">
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
                </VStack>
              </VStack>
            </Fade>
          )}
        </VStack>
      </Container>
    </Box>
  );
}
