import os
import sys
import json
from openai import OpenAI
from io import BytesIO

# Initialize the OpenAI client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def generate_speech(text):
    try:
        # Generate the speech using the streaming response
        with client.audio.speech.with_streaming_response.create(
            model="tts-1",
            voice="alloy",
            input=text
        ) as response:
            # Get the audio data directly
            buffer = BytesIO()
            response.stream_to_file(buffer)
            return buffer.getvalue()

    except Exception as e:
        print(f"Error generating speech: {str(e)}", file=sys.stderr)
        return None

if __name__ == "__main__":
    try:
        input_data = json.loads(sys.stdin.read())
        text = input_data['text']
        result = generate_speech(text)
        if result:
            sys.stdout.buffer.write(result)
        else:
            sys.exit(1)
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)
