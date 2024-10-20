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

def split_into_sentences(text):
    # This regex splits on '.', '!', and '?' while keeping the punctuation with the sentence
    sentences = re.split(r'(?<=[.!?])\s+', text)
    return [s.strip() for s in sentences if s.strip()]

def generate_images(text):
    sentences = split_into_sentences(text)

    results = []
    context = ""

    for i, sentence in enumerate(sentences):
        try:
            if i == 0:
                prompt = sentence
            else:
                prompt = f"""Context: {context}
                    Current sentence: {sentence}
                    Generate an image that continues the story, focusing on the current sentence \
                    but keeping the context in mind. Do not include any text in the image.
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
                "sentence": sentence,
                "image_data": f"data:image/png;base64,{img_base64}"
            })

            # Update context
            context += f" {sentence}"
            # Keep context to a reasonable length
            context = ' '.join(context.split()[-50:])

        except Exception as e:
            print(f"Error generating image for sentence: {sentence}", file=sys.stderr)
            print(f"Error: {str(e)}", file=sys.stderr)

    return results

if __name__ == "__main__":
    input_text = sys.stdin.read()
    input_json = json.loads(input_text)
    results = generate_images(input_json['text'])
    print(json.dumps(results))
