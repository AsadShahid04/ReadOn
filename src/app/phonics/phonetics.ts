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
    // Add timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      if (response.status === 504) {
        console.error(`Timeout error for word: ${word}`);
        // Wait 2 seconds before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
        return fetchPhonetics(word); // Retry once
      }
      console.error(`HTTP error! status: ${response.status}`);
      return null;
    }

    const data = await response.json();

    // If no data or suggestions returned
    if (!data || data.length === 0) {
      console.error(`No data found for word: ${word}`);
      return null;
    }

    // If we got string suggestions instead of word data
    if (typeof data[0] === 'string') {
      // For compound words or proper names, return basic data without phonetics
      if (word.includes('-') || /^[A-Z]/.test(word)) {
        return {
          word,
          phonetic: '',
          audio_url: null,
          definition: ''
        };
      }
      console.error(`Word not found: ${word}. Suggestions: ${data.join(', ')}`);
      return null;
    }

    const wordData = data[0];

    // For words without pronunciation data, return basic data
    if (!('hwi' in wordData) || !('prs' in wordData.hwi)) {
      return {
        word,
        phonetic: '',
        audio_url: null,
        definition: wordData.shortdef?.[0] || ''
      };
    }

    const pronunciation = wordData.hwi.prs[0];
    const phonetic = pronunciation.mw || '';
    const audioFile = pronunciation.sound?.audio || '';
    const definition = wordData.shortdef?.[0] || '';

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

  } catch (error) {
    if (error.name === 'AbortError') {
      console.error(`Request timeout for word: ${word}`);
      // Wait 2 seconds before retrying
      await new Promise(resolve => setTimeout(resolve, 2000));
      return fetchPhonetics(word); // Retry once
    }
    console.error(`Error fetching phonetics for word '${word}':`, error);
    return null;
  }
} 