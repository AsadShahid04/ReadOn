import sys
import json
import re

def syllabify(word):
    vowels = "aeiouy"
    syllables = re.findall(r'[^aeiouy]*[aeiouy]+(?:[^aeiouy]*$|[^aeiouy](?=[^aeiouy]))?', word.lower())
    return '-'.join(syllables)

def process_text(text):
    common_words = {
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
        'by', 'from', 'up', 'about', 'into', 'over', 'after', 'beneath', 'under',
        'above', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
        'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall', 'should',
        'can', 'could', 'may', 'might', 'must', 'ought', 'i', 'you', 'he', 'she', 'it',
        'we', 'they', 'them', 'their', 'this', 'that', 'these', 'those'
    }

    words = text.split()
    result = []
    for word in words:
        clean_word = ''.join(char.lower() for char in word if char.isalpha())
        if clean_word and clean_word not in common_words:
            syllable_breakdown = syllabify(clean_word)
            result.append({
                "word": clean_word,
                "syllables": syllable_breakdown
            })
    return result

if __name__ == "__main__":
    try:
        input_text = sys.stdin.read()
        input_json = json.loads(input_text)
        text = input_json['text']
        result = process_text(text)
        print(json.dumps(result))
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)
