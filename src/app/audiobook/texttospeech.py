import os
import sys
from pathlib import Path
from openai import OpenAI
from datetime import datetime

# Initialize the OpenAI client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def generate_speech(text):
    try:
        # Create an 'audio_files' directory if it doesn't exist
        audio_dir = Path(__file__).parent / "audio_files"
        audio_dir.mkdir(exist_ok=True)
        
        # Create a unique filename using timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        speech_file_path = audio_dir / f"speech_{timestamp}.mp3"
        
        # Generate the speech using the streaming response
        with client.audio.speech.with_streaming_response.create(
            model="tts-1",
            voice="alloy",
            input=text
        ) as response:
            # Stream the response to file
            response.stream_to_file(str(speech_file_path))
        
        # Return the file path as a string
        return str(speech_file_path)

    except Exception as e:
        print(f"Error generating speech: {str(e)}", file=sys.stderr)
        return None

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Please provide the text to convert to speech.", file=sys.stderr)
        sys.exit(1)

    input_text = sys.argv[1]
    result = generate_speech(input_text)
    if result:
        print(result)  # Print the file path to stdout
        print(f"Audio file created at: {result}", file=sys.stderr)  # Log to stderr for debugging
    else:
        print("Failed to generate speech.", file=sys.stderr)
        sys.exit(1)
