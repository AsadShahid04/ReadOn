"use client";

import { Box, Heading, Text, VStack, Button, HStack, Progress, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Spinner } from "@chakra-ui/react";
import Link from "next/link";
import { useText } from "../TextContext";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

interface Choice {
  text: string;
  isCorrect: boolean;
}

interface Question {
  question: string;
  choices: Choice[];
}

const ReadingComprehension = () => {
  const { inputText } = useText();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [answeredCorrectly, setAnsweredCorrectly] = useState<{ [key: number]: boolean }>({});
  const [score, setScore] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const congratsMessages = [
    "Well done! 🎉",
    "Awesome job! 🌟",
    "Great work! 👏",
    "You did amazing! 🏆",
    "Fantastic! 🎯",
    "Brilliant! ⭐",
    "Outstanding! 🌈",
  ];

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
          console.log("API Response:", data);

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

  const handleAnswerSubmit = (questionIndex: number, choiceIndex: number, isCorrect: boolean) => {
    const previouslyCorrect = answeredCorrectly[questionIndex];
    
    // Update the selected answer and correctness state
    setSelectedAnswers(prev => ({ ...prev, [questionIndex]: choiceIndex }));
    setAnsweredCorrectly(prev => ({ ...prev, [questionIndex]: isCorrect }));
    
    // Update score based on the change
    setScore(prevScore => {
      let newScore = prevScore;
      
      // If previously correct and now incorrect, decrease score
      if (previouslyCorrect && !isCorrect) {
        newScore = prevScore - 1;
      }
      // If previously incorrect/unanswered and now correct, increase score
      else if (!previouslyCorrect && isCorrect) {
        newScore = prevScore + 1;
      }
      
      return newScore;
    });

    // Show toast message
    if (isCorrect) {
      toast.success("Correct answer!");
    } else {
      toast.error("Incorrect answer. Try again!");
    }
  };

  const getButtonColor = (questionIndex: number, choiceIndex: number, isCorrect: boolean) => {
    if (selectedAnswers[questionIndex] === choiceIndex) {
      if (answeredCorrectly[questionIndex]) {
        return "green";
      } else {
        return "red";
      }
    }
    return "blue";
  };

  const calculatePercentage = () => {
    return questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  };

  // Effect to handle modal and check all questions correct status
  useEffect(() => {
    const allCorrect = questions.length > 0 && 
      questions.every((_, index) => answeredCorrectly[index]);
    
    if (allCorrect) {
      onOpen(); // Show modal when all questions are correct
    }
  }, [answeredCorrectly, questions.length]);

  const allQuestionsCorrect = questions.length > 0 && 
    questions.every((_, index) => answeredCorrectly[index]);

  return (
    <Box minHeight="100vh" py={16} px={8}>
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Congratulatory Modal */}
      <Modal 
        isOpen={isOpen} 
        onClose={onClose}
        isCentered
        motionPreset="scale"
      >
        <ModalOverlay
          bg="blackAlpha.300"
          backdropFilter="blur(10px)"
        />
        <ModalContent
          bg="white"
          p={6}
          borderRadius="xl"
          boxShadow="2xl"
        >
          <ModalHeader textAlign="center" fontSize="3xl" color="green.600">
            {congratsMessages[Math.floor(Math.random() * congratsMessages.length)]}
          </ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <Text fontSize="xl" textAlign="center" color="green.600">
                You've mastered all the questions!
              </Text>
              <Box w="full">
                <Progress
                  value={100}
                  size="lg"
                  colorScheme="green"
                  borderRadius="full"
                  hasStripe
                  isAnimated
                />
              </Box>
              <Text fontSize="lg" textAlign="center" color="gray.600">
                Final Score: {score}/{questions.length} ({calculatePercentage()}%)
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter justifyContent="center">
            <Button
              colorScheme="green"
              onClick={onClose}
              size="lg"
              borderRadius="full"
              px={8}
            >
              Continue
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="2xl" textAlign="center">
          Reading Comprehension
        </Heading>
        
        {loading ? (
          <VStack spacing={4}>
            <Spinner size="xl" />
            <Text textAlign="center">Generating questions...</Text>
            <Text textAlign="center">This may take a few moments.</Text>
          </VStack>
        ) : (
          <>
            {questions.length > 0 && (
              <Box borderWidth={1} borderRadius="lg" p={4} bg="white">
                <VStack spacing={2}>
                  <Text fontSize="xl" fontWeight="bold">
                    Score: {score}/{questions.length} ({calculatePercentage()}%)
                  </Text>
                  <Progress
                    value={calculatePercentage()}
                    width="100%"
                    colorScheme="green"
                    borderRadius="full"
                    hasStripe
                    isAnimated
                  />
                </VStack>
              </Box>
            )}

            {/* Only show congratulatory message if ALL questions are currently correct */}
            {allQuestionsCorrect && (
              <Box
                p={6}
                bg="green.100"
                borderRadius="lg"
                textAlign="center"
                animation="fadeIn 0.5s"
              >
                <Text fontSize="2xl" fontWeight="bold" color="green.600">
                  {congratsMessages[Math.floor(Math.random() * congratsMessages.length)]}
                </Text>
                <Text fontSize="lg" color="green.600" mt={2}>
                  You've mastered all the questions!
                </Text>
              </Box>
            )}

            <Text fontSize="xl" textAlign="center">
              Answer the questions based on the text you provided.
            </Text>
            <Box>
              {questions.length > 0 ? (
                questions.map((question, questionIndex) => (
                  <Box key={questionIndex} mb={8} p={4} borderWidth={1} borderRadius="md">
                    <Text fontSize="lg" fontWeight="bold" mb={4}>
                      {question.question}
                    </Text>
                    <VStack spacing={3} align="stretch">
                      {question.choices.map((choice, choiceIndex) => (
                        <Button
                          key={choiceIndex}
                          onClick={() => handleAnswerSubmit(questionIndex, choiceIndex, choice.isCorrect)}
                          colorScheme={getButtonColor(questionIndex, choiceIndex, choice.isCorrect)}
                          variant={selectedAnswers[questionIndex] === choiceIndex ? "solid" : "outline"}
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
          </>
        )}
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
