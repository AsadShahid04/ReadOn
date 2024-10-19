import { Box, Heading, Text, VStack, Button, HStack } from "@chakra-ui/react";
import Link from "next/link";
import { useState } from "react";

const phonicsData = [
  { word: "cat", phonics: ["c", "a", "t"] },
  { word: "dog", phonics: ["d", "o", "g"] },
  { word: "fish", phonics: ["f", "i", "sh"] },
];

export default function Phonics() {
  const [currentWord, setCurrentWord] = useState(0);
  const [showPhonics, setShowPhonics] = useState(false);

  const nextWord = () => {
    setCurrentWord((prev) => (prev + 1) % phonicsData.length);
    setShowPhonics(false);
  };

  return (
    <Box minHeight="100vh" py={16} px={8}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="2xl" textAlign="center">
          Phonics and Compound Words
        </Heading>
        <Box
          bg="white"
          p={8}
          borderRadius="lg"
          boxShadow="md"
          maxWidth="600px"
          margin="auto"
        >
          <VStack spacing={6} align="stretch">
            <Text fontSize="4xl" fontWeight="bold" textAlign="center">
              {phonicsData[currentWord].word}
            </Text>
            <Button colorScheme="blue" onClick={() => setShowPhonics(true)}>
              Show Phonics
            </Button>
            {showPhonics && (
              <HStack justify="center" spacing={4}>
                {phonicsData[currentWord].phonics.map((phonic, index) => (
                  <Button key={index} colorScheme="green">
                    {phonic}
                  </Button>
                ))}
              </HStack>
            )}
            <Button onClick={nextWord} colorScheme="purple">
              Next Word
            </Button>
          </VStack>
        </Box>
        <Link href="/" passHref>
          <Button as="a" colorScheme="blue">
            Back to Home
          </Button>
        </Link>
      </VStack>
    </Box>
  );
}
