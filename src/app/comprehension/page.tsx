"use client";

import { Box, Heading, Text, VStack, Button, HStack, Progress, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Spinner, Flex, Container, Fade } from "@chakra-ui/react";
import Link from "next/link";
import { useText } from "../TextContext";
import { useEffect, useState, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { FaHome } from 'react-icons/fa';

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
  const [isScoreFixed, setIsScoreFixed] = useState(false);
  const scoreBoxRef = useRef<HTMLDivElement>(null);

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

    // Updated toast notifications with custom styling
    if (isCorrect) {
      toast.success("Correct Answer! Nice job! 🎉", {
        style: {
          background: "#48BB78",
          color: "white",
          fontWeight: "bold",
        }
      });
    } else {
      toast.error("Incorrect Answer. Please Try Again! 🤔", {
        style: {
          background: "#F56565",
          color: "white",
          fontWeight: "bold",
        }
      });
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

  useEffect(() => {
    const handleScroll = () => {
      if (scoreBoxRef.current) {
        const rect = scoreBoxRef.current.getBoundingClientRect();
        const originalPosition = scoreBoxRef.current.offsetTop;
        const currentScrollPosition = window.scrollY;
        
        // Should be fixed when scrolled past original position, but not when scrolled back up
        const shouldBeFixed = currentScrollPosition > originalPosition;
        
        setIsScoreFixed(shouldBeFixed);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getRandomCongratsMessage = () => {
    const messages = [
      "🎉 Outstanding Achievement! You've mastered all the questions!",
      "🌟 Brilliant Work! Perfect score achieved!",
      "🏆 Exceptional Performance! You've aced the quiz!",
      "⭐ Remarkable Job! You've conquered all questions!",
      "🎯 Perfect Score! Your comprehension is excellent!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  if (loading) {
    return (
      <Box 
        minHeight="100vh" 
        display="flex"
        flexDirection="column"
        backgroundImage="radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.05) 1px, transparent 0)"
        backgroundSize="40px 40px"
        position="relative"
        pb={20}
      >
        <Container maxW="container.lg" mt={8}>
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
        </Container>

        <Flex 
          flex="1" 
          alignItems="center" 
          justifyContent="center"
        >
          <VStack spacing={4}>
            <Spinner size="xl" color="blue.500" thickness="4px" />
            <Text fontSize="lg" color="gray.600">Generating questions...</Text>
          </VStack>
        </Flex>

        {/* Footer */}
        <Box
          py={4}
          bgGradient="linear(to-r, blue.500, purple.600)"
          borderTop="1px"
          borderColor="blue.300"
          backdropFilter="blur(8px)"
          boxShadow="0 -4px 6px -1px rgba(0, 0, 0, 0.1)"
          zIndex={10}
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

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <Box 
        minHeight="100vh" 
        backgroundImage="radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.05) 1px, transparent 0)"
        backgroundSize="40px 40px"
        display="flex"
        flexDirection="column"
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
            <Heading 
              as="h2" 
              size="xl" 
              textAlign="center"
              color="blue.600"
            >
              Reading Comprehension
            </Heading>
            <Text 
              fontSize="lg" 
              textAlign="center" 
              maxWidth="800px" 
              mx="auto"
              color="gray.600"
              lineHeight="tall"
              mb={4}
            >
              Test your understanding with our interactive quiz. Our AI generates custom questions based on your text, 
              providing instant feedback on your answers. Track your progress with a dynamic score counter and 
              celebrate your success when you master all the questions.
            </Text>
          </VStack>
        </Container>

        {questions.length > 0 && (
          <Box 
            ref={scoreBoxRef}
            borderWidth={1} 
            borderRadius={isScoreFixed ? "0" : "lg"}
            p={isScoreFixed ? 4 : 8}
            bg="white"
            mb={8}
            mx="auto"
            maxW="800px"
            width="100%"
            style={{
              position: isScoreFixed ? 'fixed' : 'relative',
              top: isScoreFixed ? '0' : 'auto',
              left: isScoreFixed ? '50%' : 'auto',
              transform: isScoreFixed ? 'translateX(-50%)' : 'none',
              zIndex: isScoreFixed ? 1000 : 1,
              boxShadow: isScoreFixed ? '0 2px 10px rgba(0, 0, 0, 0.1)' : 'none',
              width: '100%',
              maxWidth: "800px",
              transition: 'all 0.3s ease',
            }}
          >
            <VStack spacing={3}>
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
                height="12px"
              />
            </VStack>
          </Box>
        )}

        {isScoreFixed && questions.length > 0 && (
          <Box height="100px" />
        )}

        {/* Questions */}
        <VStack spacing={8} align="stretch" maxW="1200px" mx="auto" mb={16}>
          {questions.length > 0 ? (
            questions.map((question, questionIndex) => (
              <Box 
                key={questionIndex} 
                p={8}
                borderWidth={1} 
                borderRadius="lg"
                bg="white"
                boxShadow="sm"
                _hover={{ boxShadow: "md" }}
                transition="all 0.2s"
              >
                <Text fontSize="lg" fontWeight="bold" mb={4}>
                  Question {questionIndex + 1}: {question.question}
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
                      py={3}
                      px={4}
                    >
                      {String.fromCharCode(97 + choiceIndex)}. {choice.text}
                    </Button>
                  ))}
                </VStack>
              </Box>
            ))
          ) : (
            <Text textAlign="center">No questions generated yet. Please provide some text to generate questions.</Text>
          )}
        </VStack>

        {/* Success Modal */}
        <Modal isOpen={isOpen} onClose={onClose} isCentered motionPreset="scale" size="lg">
          <ModalOverlay
            bg="blackAlpha.300"
            backdropFilter="blur(10px)"
          />
          <ModalContent
            mx={4}
            bg="white"
            p={8}
            borderRadius="xl"
            boxShadow="xl"
          >
            <ModalHeader
              textAlign="center"
              fontSize="3xl"
              bgGradient="linear(to-r, blue.400, purple.500, pink.500)"
              bgClip="text"
              fontWeight="bold"
              pb={4}
            >
              Congratulations! 🎉
            </ModalHeader>
            <ModalBody>
              <VStack spacing={6}>
                <Text
                  fontSize="xl"
                  textAlign="center"
                  color="gray.700"
                  fontWeight="medium"
                >
                  {getRandomCongratsMessage()}
                </Text>
                <Text
                  fontSize="lg"
                  textAlign="center"
                  color="gray.600"
                >
                  Score: {score}/{questions.length} ({calculatePercentage()}%)
                </Text>
              </VStack>
            </ModalBody>
            <ModalFooter justifyContent="center" pt={6}>
              <Button
                colorScheme="blue"
                onClick={onClose}
                size="lg"
                px={8}
                py={6}
                fontSize="lg"
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "lg",
                }}
                transition="all 0.2s"
              >
                Read On!
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Add Footer */}
        <Box
          py={4}
          bgGradient="linear(to-r, blue.500, purple.600)"
          borderTop="1px"
          borderColor="blue.300"
          backdropFilter="blur(8px)"
          boxShadow="0 -4px 6px -1px rgba(0, 0, 0, 0.1)"
          zIndex={10}
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
    </>
  );
};

export default ReadingComprehension;
