"use client";

import { useState } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  Button,
  SimpleGrid,
  Textarea,
  useColorModeValue,
  Container,
  Fade,
} from "@chakra-ui/react";
import Link from "next/link";

const FeatureButton = ({ href, title, description, userText }) => (
  <Link href={{ pathname: href, query: { text: userText } }} passHref legacyBehavior>
    <Button
      as="a"
      height="auto"
      p={6}
      colorScheme="blue"
      variant="outline"
      width="100%"
      transition="all 0.3s"
      _hover={{ transform: "translateY(-5px)", boxShadow: "lg" }}
    >
      <VStack align="start" spacing={2}>
        <Text fontSize="xl" fontWeight="bold">
          {title}
        </Text>
        <Text fontSize="sm">{description}</Text>
      </VStack>
    </Button>
  </Link>
);

export default function Home() {
  const [userText, setUserText] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const textColor = useColorModeValue("gray.800", "gray.100");

  const handleSubmit = () => {
    if (userText.trim()) {
      setIsSubmitted(true);
    }
  };

  return (
    <Box minHeight="100vh" py={16} px={8} bg={bgColor} color={textColor}>
      <Container maxW="container.xl">
        <VStack spacing={12} align="stretch">
          <Fade in={true}>
            <VStack spacing={4}>
              <Heading as="h1" size="2xl" textAlign="center">
                Read On
              </Heading>
              <Text fontSize="xl" textAlign="center">
                Your AI Reading Companion
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
                value={userText}
                onChange={(e) => setUserText(e.target.value)}
                bg={useColorModeValue("white", "gray.700")}
                minHeight="200px"
              />
              <Button colorScheme="blue" size="lg" onClick={handleSubmit}>
                Submit
              </Button>
            </VStack>
          ) : (
            <Fade in={true}>
              <VStack spacing={8}>
                <Text fontSize="lg" fontWeight="medium" textAlign="center">
                  Click One of the Options Below to Get Started
                </Text>
                <SimpleGrid columns={[1, null, 2]} spacing={8}>
                  <FeatureButton
                    href="/phonics"
                    title="Phonics and Compound Words"
                    description="Learn and practice phonics with interactive exercises"
                    userText={userText}
                  />
                  <FeatureButton
                    href="/comprehension"
                    title="Reading Comprehension"
                    description="Improve your understanding with text analysis tools"
                    userText={userText}
                  />
                  <FeatureButton
                    href="/visualization"
                    title="Word Visualization"
                    description="Visualize words and their relationships"
                    userText={userText}
                  />
                  <FeatureButton
                    href="/assessment"
                    title="Assessment Tools"
                    description="Test your knowledge and get personalized feedback"
                    userText={userText}
                  />
                </SimpleGrid>
              </VStack>
            </Fade>
          )}
        </VStack>
      </Container>
    </Box>
  );
}
