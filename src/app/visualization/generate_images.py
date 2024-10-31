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

# Initialize the OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def split_into_paragraphs(text):
    # Split text into paragraphs based on double newlines or multiple newlines
    paragraphs = re.split(r'\n\s*\n', text)
    return [p.strip() for p in paragraphs if p.strip()]

def split_into_sentences(text):
    # This regex splits on '.', '!', and '?' while keeping the punctuation with the sentence
    sentences = re.split(r'(?<=[.!?])\s+', text)
    return [s.strip() for s in sentences if s.strip()]

def generate_images(text):
    # First, try to split into paragraphs
    paragraphs = split_into_paragraphs(text)
    
    # If there's only one paragraph, split it into sentences instead
    if len(paragraphs) <= 1:
        segments = split_into_sentences(text)
        segment_type = "sentence"
    else:
        segments = paragraphs
        segment_type = "paragraph"

    # Filter out any empty segments and duplicates
    segments = list(dict.fromkeys([s.strip() for s in segments if s.strip()]))
    results = []
    total_segments = len(segments)
    context = ""

    print(f"Starting processing of {total_segments} segments", file=sys.stderr)

    for i, segment in enumerate(segments):
        print(f"Processing segment {i+1}/{total_segments}", file=sys.stderr)
        
        # Keep trying until the image is generated successfully
        while True:
            try:
                # Create prompt based on context
                if i == 0:
                    prompt = f"""
                        Starting {segment_type}: {segment}
                        Generate an image that best represents this {segment_type}.
                        Create a cohesive visual that captures the main elements and mood.
                    """
                else:
                    prompt = f"""Context: {context}
                        Current {segment_type}: {segment}
                        Generate an image that continues the story, focusing on the current {segment_type} \
                        while maintaining visual consistency with the context. Do not include any text in the image.
                    """

                # Add delay between requests to avoid rate limits
                if i > 0:
                    print(f"Waiting 12 seconds before processing next segment...", file=sys.stderr)
                    time.sleep(12)

                # Generate image
                response = client.images.generate(
                    model="dall-e-3",
                    prompt=prompt,
                    size="1024x1024",
                    quality="standard",
                    n=1,
                )

                image_url = response.data[0].url

                # Download image and convert to base64
                image_response = requests.get(image_url)
                if not image_response.ok:
                    raise Exception(f"Failed to download image: {image_response.status_code}")

                img_data = BytesIO(image_response.content)
                img_base64 = base64.b64encode(img_data.getvalue()).decode()

                # Add to results only after successful generation and download
                results.append({
                    "segment": segment,
                    "image_data": f"data:image/png;base64,{img_base64}",
                    "segment_type": segment_type
                })

                # Update context after successful generation
                context += f" {segment}"
                if len(context.split()) > 200:
                    context = ' '.join(context.split()[-200:])

                print(f"Successfully processed segment {i+1}/{total_segments}", file=sys.stderr)
                # Break the while loop if successful
                break

            except Exception as e:
                error_message = str(e)
                print(f"Error generating image for segment {i+1}: {error_message}", file=sys.stderr)
                
                if "rate_limit" in error_message.lower():
                    print("Rate limit hit, waiting 30 seconds before retrying...", file=sys.stderr)
                    time.sleep(30)
                    continue  # Try again with the same segment
                else:
                    print("Unexpected error, waiting 30 seconds before retrying...", file=sys.stderr)
                    time.sleep(30)
                    continue  # Try again with the same segment

    print("All segments processed successfully", file=sys.stderr)
    return results

if __name__ == "__main__":
    try:
        input_text = sys.stdin.read()
        input_json = json.loads(input_text)
        results = generate_images(input_json['text'])
        print(json.dumps(results))
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)
