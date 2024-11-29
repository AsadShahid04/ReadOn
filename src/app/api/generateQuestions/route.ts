import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    const questionsCount = Math.min(
      Math.max(1, Math.ceil(text.length / 200)),
      15
    );

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Generate exactly ${questionsCount} multiple-choice comprehension questions for the following text: ${text}. 
    The questions should cover different aspects of the text and vary in difficulty.
    Format the output as a valid JSON object with this structure:
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
    }
    Important: Return only the JSON object, without any markdown formatting or backticks.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    const cleanedResponse = response
      .replace(/```json\s*/g, '')
      .replace(/```/g, '')
      .trim();

    try {
      const questions = JSON.parse(cleanedResponse);

      if (!questions.questions || !Array.isArray(questions.questions)) {
        throw new Error('Invalid response structure');
      }

      questions.questions.forEach((q: any, index: number) => {
        if (!q.question || !Array.isArray(q.choices) || q.choices.length !== 4) {
          throw new Error(`Invalid question structure at index ${index}`);
        }
      });

      return NextResponse.json(questions);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      return NextResponse.json(
        { 
          error: 'Failed to parse questions', 
          details: parseError instanceof Error ? parseError.message : 'Unknown parsing error'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error generating questions:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate questions', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
