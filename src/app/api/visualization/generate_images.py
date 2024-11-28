import os
import json
import sys
import re
from dotenv import load_dotenv
from openai import OpenAI
import base64
import requests
from io import BytesIO
import time

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def split_into_paragraphs(text: str) -> list:
    """Split text into paragraphs based on double newlines."""
    paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
    return paragraphs

def split_into_sentences(text: str) -> list:
    """Split text into sentences using regex."""
    # This regex splits on '.', '!', and '?' followed by spaces or newlines
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    return [s.strip() for s in sentences if s.strip()]

def generate_image_with_retry(prompt: str, retries=5, delay=30) -> str:
    """Generate image with retry logic for rate limits"""
    for attempt in range(retries):
        try:
            response = client.images.generate(
                model="dall-e-3",
                prompt=prompt,
                n=1,
                size="1024x1024",
                quality="standard",
            )
            return response.data[0].url
        except Exception as e:
            if "rate_limit" in str(e).lower() and attempt < retries - 1:
                print(f"Rate limit hit, waiting {delay} seconds before retry {attempt + 1}...", file=sys.stderr)
                time.sleep(delay)
                continue
            raise e

def process_text(text: str) -> list:
    """Process text and generate images with progress tracking"""
    # First split into paragraphs
    paragraphs = split_into_paragraphs(text)
    
    # If only one paragraph, split it into sentences instead
    if len(paragraphs) <= 1:
        segments = split_into_sentences(text)
        segment_type = 'sentence'
    else:
        segments = paragraphs
        segment_type = 'paragraph'
    
    # Filter out any empty segments and remove duplicates
    segments = list(dict.fromkeys([s.strip() for s in segments if s.strip()]))
    results = []
    total_segments = len(segments)

    print(f"Starting processing of {total_segments} segments", file=sys.stderr)

    for i, segment in enumerate(segments, 1):
        try:
            print(f"Processing segment {i}/{total_segments}", file=sys.stderr)
            
            # Create prompt based on context
            if i == 1:
                prompt = f"""
                    Starting {segment_type}: {segment}
                    Generate a detailed, realistic image that best represents this {segment_type}.
                    Create a cohesive visual that captures the main elements and mood.
                    Do not include any text in the image.
                """
            else:
                prompt = f"""
                    Context: {' '.join(segments[:i-1])}
                    Current {segment_type}: {segment}
                    Generate an image that continues the story, focusing on the current {segment_type} \
                    while maintaining visual consistency with the previous context. \
                    Create a cohesive scene that flows naturally from the previous segments. \
                    Do not include any text in the image.
                """
            
            # Generate image with retry logic
            image_url = generate_image_with_retry(prompt)
            
            # Download image
            response = requests.get(image_url)
            if response.status_code == 200:
                # Convert to base64
                image_data = base64.b64encode(response.content).decode('utf-8')
                results.append({
                    'segment': segment,
                    'image_data': f"data:image/png;base64,{image_data}",
                    'segment_type': segment_type
                })
                
                print(f"Progress: {i}/{total_segments} segments processed", file=sys.stderr)
            
        except Exception as e:
            print(f"Error processing segment {i}: {str(e)}", file=sys.stderr)
            continue

    return results

if __name__ == "__main__":
    try:
        input_text = sys.stdin.read()
        input_json = json.loads(input_text)
        text = input_json['text']
        results = process_text(text)
        print(json.dumps({'results': results}))
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)
