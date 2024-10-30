import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  const { text } = await request.json();

  // Calculate number of questions based on text length
  // Ensure at least 1 question for texts under 200 characters
  const questionsCount = Math.min(
    Math.max(1, Math.ceil(text.length / 200)), // One question per 200 characters, minimum 1
    15 // Maximum of 15 questions
  );

  // Initialize the GoogleGenerativeAI with your API key
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Generate content based on the input text
  const prompt = `Generate exactly ${questionsCount} multiple-choice comprehension questions for the following text: ${text}. 
  The questions should cover different aspects of the text and vary in difficulty.
  Format the output as follows:
  {
    "questions": [
      {
        "question": "What is the main idea of the text?",
        "choices": [
          { "text": "Choice A", "isCorrect": false },
          { "text": "Choice B", "isCorrect": true },
          { "text": "Choice C", "isCorrect": false },
          { "text": "Choice D", "isCorrect": false }
        ]
      }
    ]
  }`;

  try {
    const result = await model.generateContent(prompt);
    const questionsString = result.response.text();

    console.log('Gemini API Response:', questionsString);
    console.log('Number of questions requested:', questionsCount);
    console.log('Text length:', text.length);

    // Remove any leading/trailing backticks and "json" tag if present
    const cleanedString = questionsString.replace(/^```json\s*|\s*```$/g, '').trim();

    // Parse the cleaned string as JSON
    const questions = JSON.parse(cleanedString);

    // Verify we got the correct number of questions
    if (questions.questions.length !== questionsCount) {
      console.warn(`Expected ${questionsCount} questions but got ${questions.questions.length}`);
    }

    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error generating questions:', error);
    return NextResponse.json({ error: 'Failed to generate questions' }, { status: 500 });
  }
}
