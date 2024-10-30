"use client";

import { useEffect, useState, useRef } from "react";
import { Box, Heading, Text, VStack, Button, Spinner, useToast } from "@chakra-ui/react";
import { useText } from "../TextContext";
import Link from "next/link";

const Audiobook = () => {
  const { inputText } = useText();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const words = inputText.split(/\s+/);
  const toast = useToast();

  useEffect(() => {
    if (inputText) {
      generateAudio();
      setAudioReady(false);
      setAudioUrl(null);
    }
  }, [inputText]);

  const generateAudio = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/text-to-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate audio");
      }

      const audioBlob = await response.blob();
      console.log("Received audio blob:", audioBlob);
      console.log("Blob size:", audioBlob.size);
      console.log("Blob type:", audioBlob.type);

      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      
      if (audioRef.current) {
        audioRef.current.src = url;
        
        // Add more event listeners for debugging
        audioRef.current.onloadeddata = () => {
          console.log("Audio data loaded");
          setAudioReady(true);
        };
        
        audioRef.current.oncanplay = () => {
          console.log("Audio can play");
          setAudioReady(true);
        };

        audioRef.current.onloadedmetadata = () => {
          console.log("Audio metadata loaded, duration:", audioRef.current?.duration);
          setAudioReady(true);
        };

        audioRef.current.onerror = (e) => {
          console.error("Audio loading error:", audioRef.current?.error);
          toast({
            title: "Error",
            description: `Failed to load audio: ${audioRef.current?.error?.message || 'Unknown error'}`,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        };
      }
    } catch (error) {
      console.error("Error generating audio:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayPause = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        console.log("Pausing audio");
        await audioRef.current.pause();
      } else {
        console.log("Playing audio");
        // Reset the audio to start if it ended
        if (audioRef.current.ended) {
          audioRef.current.currentTime = 0;
        }
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Playback error:", error);
            toast({
              title: "Playback Error",
              description: error.message || "Failed to play audio",
              status: "error",
              duration: 5000,
              isClosable: true,
            });
          });
        }
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error("Playback error:", error);
      toast({
        title: "Playback Error",
        description: "Failed to play audio. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const currentTime = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      // Calculate which word should be highlighted based on current time
      const wordIndex = Math.floor((currentTime / duration) * words.length);
      if (wordIndex >= 0 && wordIndex < words.length) {
        setCurrentWordIndex(wordIndex);
      }
    }
  };

  // Cleanup function to revoke object URL
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  return (
    <Box minHeight="100vh" py={16} px={8}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="2xl" textAlign="center">
          Read Aloud
        </Heading>
        {isLoading ? (
          <VStack spacing={4}>
            <Spinner size="xl" />
            <Text>Generating audio...</Text>
          </VStack>
        ) : (
          <>
            <Box borderWidth={1} borderRadius="lg" p={4} maxHeight="60vh" overflowY="auto">
              <Text fontSize="lg" lineHeight="tall">
                {words.map((word, index) => (
                  <Text
                    key={index}
                    as="span"
                    bg={index === currentWordIndex ? "yellow.200" : "transparent"}
                    display="inline-block"
                    mx={1}
                  >
                    {word}
                  </Text>
                ))}
              </Text>
            </Box>
            <audio
              ref={audioRef}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => {
                setIsPlaying(false);
                setCurrentWordIndex(-1);
              }}
              onPlay={() => {
                console.log("Audio started playing");
                setIsPlaying(true);
              }}
              onPause={() => {
                console.log("Audio paused");
                setIsPlaying(false);
              }}
              controls // Add controls for debugging
            />
            <Button 
              onClick={togglePlayPause} 
              colorScheme="blue"
              isDisabled={!audioReady}
            >
              {isPlaying ? "Pause" : "Play"}
            </Button>
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

export default Audiobook;
