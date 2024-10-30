import os
import sys
import json
import requests
from typing import List, Dict, Set

def filter_common_words(words: List[str]) -> Set[str]:
    common_words = {
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
        'by', 'from', 'up', 'about', 'into', 'over', 'after', 'beneath', 'under',
        'above', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
        'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall', 'should',
        'can', 'could', 'may', 'might', 'must', 'ought', 'i', 'you', 'he', 'she', 'it',
        'we', 'they', 'them', 'their', 'this', 'that', 'these', 'those', 'as', 'if',
        'when', 'where', 'why', 'how', 'all', 'any', 'some', 'no', 'not', 'yes',
        'him', 'his', 'her', 'mine', 'yours', 'ours', 'theirs',
        'my', 'your', 'our', 'its', 'here', 'there', 'now', 'then'
    }
    
    # Convert to lowercase and remove common words
    unique_words = {word.lower() for word in words if word.lower() not in common_words}
    return unique_words

def get_word_data(word: str, api_key: str) -> Dict:
    base_url = "https://www.dictionaryapi.com/api/v3/references/collegiate/json"
    url = f"{base_url}/{word}?key={api_key}"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        if not data or not isinstance(data[0], dict):
            return None
            
        word_data = data[0]
        
        # Extract phonetic spelling and audio file info
        if 'hwi' in word_data and 'prs' in word_data['hwi']:
            pronunciation = word_data['hwi']['prs'][0]
            phonetic = pronunciation.get('mw', '')
            
            # Get audio file info
            sound_info = pronunciation.get('sound', {})
            audio_file = sound_info.get('audio', '')
            
            return {
                "word": word,
                "phonetic": phonetic,
                "audio_file": audio_file,
                "audio_url": get_audio_url(audio_file) if audio_file else None
            }
            
        return None
        
    except Exception as e:
        print(f"Error fetching data for word '{word}': {str(e)}", file=sys.stderr)
        return None

def get_audio_url(audio_file: str) -> str:
    # Determine the subdirectory based on the audio filename
    if audio_file.startswith('bix'):
        subdir = 'bix'
    elif audio_file.startswith('gg'):
        subdir = 'gg'
    elif audio_file.startswith('_'):
        subdir = 'number'
    else:
        subdir = audio_file[0]
    
    return f"https://media.merriam-webster.com/audio/prons/en/us/mp3/{subdir}/{audio_file}.mp3"

def process_text(text: str) -> List[Dict]:
    api_key = os.getenv('MERRIAM_WEBSTER_API_KEY')
    if not api_key:
        raise ValueError("Merriam-Webster API key not found in environment variables")
    
    # Split text into words and remove punctuation
    words = [word.strip('.,!?()[]{}":;') for word in text.split()]
    
    # Filter out common words and get unique words
    unique_words = filter_common_words(words)
    
    # Get dictionary data for each word
    results = []
    for word in unique_words:
        word_data = get_word_data(word, api_key)
        if word_data:
            results.append(word_data)
    
    return results

if __name__ == "__main__":
    try:
        input_text = sys.stdin.read()
        input_json = json.loads(input_text)
        text = input_json['text']
        results = process_text(text)
        print(json.dumps(results))
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1) 