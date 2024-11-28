import os
import sys
import json
from pathlib import Path
from openai import OpenAI
from datetime import datetime

# Initialize the OpenAI client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

def generate_speech(text):
    try:
        # Check if we're in production (Vercel) or development
        is_production = os.environ.get('VERCEL_ENV') == 'production'
        project_root = Path(__file__).parent.parent.parent.parent.parent
        
        if is_production:
            # In production, use /tmp directory for temporary file storage
            audio_dir = Path('/tmp')
        else:
            # In development, use public directory
            audio_dir = project_root / "public" / "audio_files"
            audio_dir.mkdir(parents=True, exist_ok=True)
        
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
    try:
        input_data = json.loads(sys.stdin.read())
        text = input_data['text']
        result = generate_speech(text)
        if result:
            print(result)
        else:
            sys.exit(1)
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)
