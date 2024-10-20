import sys
import json
import eng_to_ipa as ipa

def decompose_text(text):
    words = text.split()
    ipa_words = []
    for word in words:
        clean_word = ''.join(char for char in word if char.isalpha())
        if clean_word:
            ipa_word = ipa.convert(clean_word)
            ipa_symbols = list(ipa_word)
            ipa_words.append({
                "word": clean_word.lower(),
                "ipa": ipa_word,
                "ipa_symbols": ipa_symbols
            })
    return ipa_words

if __name__ == "__main__":
    try:
        input_text = sys.stdin.read()
        input_json = json.loads(input_text)
        text = input_json['text']
        result = decompose_text(text)
        print(json.dumps(result))
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)
