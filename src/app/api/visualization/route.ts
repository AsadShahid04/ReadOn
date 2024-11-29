import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function splitIntoParagraphs(text: string): string[] {
  return text.split(/\n\n/).filter(p => p.trim());
}

function splitIntoSentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/).filter(s => s.trim());
}

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    
    // Split text into segments
    let segments = splitIntoParagraphs(text);
    let segmentType = 'paragraph';
    
    // If only one paragraph, split into sentences
    if (segments.length <= 1) {
      segments = splitIntoSentences(text);
      segmentType = 'sentence';
    }
    
    // Remove duplicates and empty segments
    segments = Array.from(new Set(segments.filter(s => s.trim())));
    
    const results = [];
    
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      
      // Create prompt based on context
      const prompt = i === 0 
        ? `Starting ${segmentType}: ${segment}
           Generate a detailed, realistic image that best represents this ${segmentType}.
           Create a cohesive visual that captures the main elements and mood.
           Do not include any text in the image.`
        : `Context: ${segments.slice(0, i).join(' ')}
           Current ${segmentType}: ${segment}
           Generate an image that continues the story, focusing on the current ${segmentType}
           while maintaining visual consistency with the previous context.
           Create a cohesive scene that flows naturally from the previous segments.
           Do not include any text in the image.`;

      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      });

      const imageUrl = response.data[0].url;
      if (!imageUrl) continue;

      // Fetch the image and convert to base64
      const imageResponse = await fetch(imageUrl);
      const imageBuffer = await imageResponse.arrayBuffer();
      const base64Image = Buffer.from(imageBuffer).toString('base64');

      results.push({
        segment,
        image_data: `data:image/png;base64,${base64Image}`,
        segment_type: segmentType
      });
    }

    return NextResponse.json({ results });

  } catch (error) {
    console.error('Error in visualization route:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
