import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface VisualizationResult {
  segment: string;
  image_data: string;
  segment_type: 'paragraph' | 'sentence';
}

function splitIntoParagraphs(text: string): string[] {
  return text.split(/\n\n/).filter(p => p.trim());
}

function splitIntoSentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/).filter(s => s.trim());
}

// Add timeout to fetch
async function fetchWithTimeout(url: string, timeout = 8000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    
    // Split text into segments
    let segments = splitIntoParagraphs(text);
    let segmentType: 'paragraph' | 'sentence' = 'paragraph';
    
    if (segments.length <= 1) {
      segments = splitIntoSentences(text);
      segmentType = 'sentence';
    }
    
    // Limit the number of segments to prevent timeout
    segments = Array.from(new Set(segments.filter(s => s.trim()))).slice(0, 3);
    
    const results: (VisualizationResult | undefined)[] = new Array(segments.length);
    
    // Process segments concurrently with Promise.all
    await Promise.all(segments.map(async (segment, i) => {
      try {
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
        if (!imageUrl) return;

        // Fetch image with timeout
        const imageResponse = await fetchWithTimeout(imageUrl);
        const imageBuffer = await imageResponse.arrayBuffer();
        const base64Image = Buffer.from(imageBuffer).toString('base64');

        results[i] = {
          segment,
          image_data: `data:image/png;base64,${base64Image}`,
          segment_type: segmentType
        };
      } catch (error) {
        console.error(`Error processing segment ${i}:`, error);
      }
    }));

    // Filter out any null results from failed generations
    const validResults = results.filter((result): result is VisualizationResult => result !== undefined);

    if (validResults.length === 0) {
      throw new Error('Failed to generate any valid images');
    }

    return NextResponse.json({ results: validResults });

  } catch (error) {
    console.error('Error in visualization route:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
