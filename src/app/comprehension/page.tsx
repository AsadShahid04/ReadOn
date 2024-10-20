"use client";

import { Box, Heading, Text, VStack, Button, HStack } from "@chakra-ui/react";
import Link from "next/link";
import { useText } from "../TextContext";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const ReadingComprehension = () => {
  const { inputText } = useText();
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (inputText) {
        setLoading(true);
        try {
          const response = await fetch("/api/generateQuestions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ text: inputText }),
          });

          const data = await response.json();
          console.log("API Response:", data); // Log the entire response

          if (data.questions && Array.isArray(data.questions)) {
            setQuestions(data.questions);
          } else if (data.error) {
            console.error("API Error:", data.error);
            toast.error(`Failed to generate questions: ${data.error}`);
          } else {
            console.error("Unexpected response format:", data);
            toast.error("Unexpected response from the server. Please try again.");
          }
        } catch (error) {
          console.error("Error fetching questions:", error);
          toast.error("An error occurred while generating questions.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchQuestions();
  }, [inputText]);

  const handleAnswerSubmit = (isCorrect: boolean) => {
    if (isCorrect) {
      toast.success("Correct answer!");
    } else {
      toast.error("Incorrect answer. Try again!");
    }
  };

  return (
    <Box minHeight="100vh" py={16} px={8}>
      <ToastContainer position="top-right" autoClose={3000} />
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="2xl" textAlign="center">
          Reading Comprehension
        </Heading>
        <Text fontSize="xl" textAlign="center">
          Answer the questions based on the text you provided.
        </Text>
        <Box>
          {loading ? (
            <Text>Loading questions...</Text>
          ) : questions.length > 0 ? (
            questions.map((question, index) => (
              <Box key={index} mb={8} p={4} borderWidth={1} borderRadius="md">
                <Text fontSize="lg" fontWeight="bold" mb={4}>
                  {question.question}
                </Text>
                <VStack spacing={3} align="stretch">
                  {question.choices.map((choice: any, choiceIndex: number) => (
                    <Button
                      key={choiceIndex}
                      onClick={() => handleAnswerSubmit(choice.isCorrect)}
                      colorScheme="blue"
                      variant="outline"
                      justifyContent="flex-start"
                      height="auto"
                      whiteSpace="normal"
                      textAlign="left"
                      py={2}
                    >
                      {choice.text}
                    </Button>
                  ))}
                </VStack>
              </Box>
            ))
          ) : (
            <Text>No questions generated yet. Please provide some text to generate questions.</Text>
          )}
        </Box>
        <Link href="/" passHref>
          <Button as="a" colorScheme="blue">
            Back to Home
          </Button>
        </Link>
      </VStack>
    </Box>
  );
};

export default ReadingComprehension;
