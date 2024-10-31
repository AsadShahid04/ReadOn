interface PhoneticData {
  word: string;
  phonetic: string;
  audio_url: string | null;
  definition: string;
}

export async function fetchPhonetics(word: string): Promise<PhoneticData | null> {
  const apiKey = process.env.MERRIAM_WEBSTER_API_KEY;
  if (!apiKey) {
    console.error('Merriam-Webster API key not found');
    return null;
  }

  const baseUrl = "https://www.dictionaryapi.com/api/v3/references/collegiate/json";
  const url = `${baseUrl}/${word}?key=${apiKey}`;

  try {
    const response = await fetch(url);
    
    // Check if response is ok
    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      return null;
    }

    // Check content type
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("Received non-JSON response from API");
      return null;
    }

    const data = await response.json();

    // Check if data is valid
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.error(`No data found for word: ${word}`);
      return null;
    }

    // Check if first result is a string (suggestions) instead of an object
    if (typeof data[0] === 'string') {
      console.error(`Word not found: ${word}. Suggestions: ${data.join(', ')}`);
      return null;
    }

    const wordData = data[0];

    // Extract phonetic spelling and audio file info
    if ('hwi' in wordData && 'prs' in wordData.hwi) {
      const pronunciation = wordData.hwi.prs[0];
      const phonetic = pronunciation.mw || '';
      const audioFile = pronunciation.sound?.audio || '';

      // Get the first short definition
      const definition = wordData.shortdef?.[0] || '';

      // Get audio URL
      let audioUrl = null;
      if (audioFile) {
        let subdir;
        if (audioFile.startsWith('bix')) {
          subdir = 'bix';
        } else if (audioFile.startsWith('gg')) {
          subdir = 'gg';
        } else if (audioFile.startsWith('_')) {
          subdir = 'number';
        } else {
          subdir = audioFile[0];
        }
        audioUrl = `https://media.merriam-webster.com/audio/prons/en/us/mp3/${subdir}/${audioFile}.mp3`;
      }

      return {
        word,
        phonetic,
        audio_url: audioUrl,
        definition
      };
    }

    console.error(`No pronunciation data found for word: ${word}`);
    return null;

  } catch (error) {
    console.error(`Error fetching phonetics for word '${word}':`, error);
    return null;
  }
} 