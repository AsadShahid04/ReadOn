import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  const { text } = await request.json();

  // Initialize the GoogleGenerativeAI with your API key
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Generate content based on the input text
  const prompt = `Generate multiple-choice comprehension questions for the following text: ${text}. 
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

    // Remove any leading/trailing backticks and "json" tag if present
    const cleanedString = questionsString.replace(/^```json\s*|\s*```$/g, '').trim();

    // Parse the cleaned string as JSON
    const questions = JSON.parse(cleanedString);

    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error generating questions:', error);
    return NextResponse.json({ error: 'Failed to generate questions' }, { status: 500 });
  }
}
