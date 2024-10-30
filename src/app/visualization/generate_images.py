import os
import json
import sys
import re
from dotenv import load_dotenv
from openai import OpenAI
import base64
import requests
from io import BytesIO

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

    results = []
    context = ""

    for i, segment in enumerate(segments):
        try:
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

            response = client.images.generate(
                model="dall-e-3",
                prompt=prompt,
                size="1024x1024",
                quality="standard",
                n=1,
            )

            image_url = response.data[0].url

            # Download the image and convert to base64
            image_response = requests.get(image_url)
            img_data = BytesIO(image_response.content)
            img_base64 = base64.b64encode(img_data.getvalue()).decode()

            results.append({
                "segment": segment,
                "image_data": f"data:image/png;base64,{img_base64}",
                "segment_type": segment_type
            })

            # Update context
            context += f" {segment}"
            # Keep context to a reasonable length
            if len(context.split()) > 200:  # Increased context length for paragraphs
                context = ' '.join(context.split()[-200:])

        except Exception as e:
            print(f"Error generating image for {segment_type}: {segment}", file=sys.stderr)
            print(f"Error: {str(e)}", file=sys.stderr)

    return results

if __name__ == "__main__":
    input_text = sys.stdin.read()
    input_json = json.loads(input_text)
    results = generate_images(input_json['text'])
    print(json.dumps(results))
