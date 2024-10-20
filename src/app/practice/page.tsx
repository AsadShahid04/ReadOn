"use client";

import { useEffect, useState } from "react";
import { Box, Heading, Text, VStack } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

export default function PracticePage() {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // or a loading indicator
  }

  return (
    <Box minHeight="100vh" py={16} px={8}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="2xl" textAlign="center">
          Practice Page
        </Heading>
        <Text fontSize="xl" textAlign="center">
          This is the practice page content.
        </Text>
        {/* Add your practice page content here */}
      </VStack>
    </Box>
  );
}
