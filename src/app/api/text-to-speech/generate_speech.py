import sys
import os
from pathlib import Path
import openai
import tempfile

# Set up OpenAI API key
openai.api_key = os.getenv('OPENAI_API_KEY')

def generate_speech(text):
    try:
        response = openai.audio.speech.create(
            model="tts-1",
            voice="alloy",
            input=text
        )

        # Create a temporary file to store the audio
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as temp_file:
            temp_file.write(response.content)
            return temp_file.name

    except Exception as e:
        print(f"Error generating speech: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Please provide the text to convert to speech.", file=sys.stderr)
        sys.exit(1)

    input_text = sys.argv[1]
    audio_file_path = generate_speech(input_text)
    print(audio_file_path) 