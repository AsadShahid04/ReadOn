import {
  Box,
  Heading,
  Text,
  VStack,
  Button,
  SimpleGrid,
} from "@chakra-ui/react";
import Link from "next/link";

const FeatureButton = ({ href, title, description }) => (
  <Link href={href} passHref>
    <Button
      as="a"
      height="auto"
      p={6}
      colorScheme="blue"
      variant="outline"
      width="100%"
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
  return (
    <Box minHeight="100vh" py={16} px={8}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="2xl" textAlign="center">
          ReadOn
        </Heading>
        <Text fontSize="xl" textAlign="center">
          Enhance your reading skills with our interactive tools.
        </Text>
        <SimpleGrid columns={[1, null, 2]} spacing={6}>
          <FeatureButton
            href="/phonics"
            title="Phonics and Compound Words"
            description="Learn and practice phonics with interactive exercises"
          />
          <FeatureButton
            href="/comprehension"
            title="Reading Comprehension"
            description="Improve your understanding with text analysis tools"
          />
          <FeatureButton
            href="/interactive"
            title="Interactive Learning"
            description="Visualize words and practice pronunciation"
          />
          <FeatureButton
            href="/assessment"
            title="Assessment Tools"
            description="Test your knowledge and get personalized feedback"
          />
        </SimpleGrid>
      </VStack>
    </Box>
  );
}
