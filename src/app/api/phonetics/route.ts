import { NextResponse } from 'next/server';

interface WordData {
  word: string;
  phonetic: string;
  audio_url: string | null;
  definition: string;
}

function getBaseForm(word: string): string {
  word = word.toLowerCase();
  
  // Irregular plurals
  const irregularPlurals: { [key: string]: string } = {
    'children': 'child',
    'mice': 'mouse',
    'feet': 'foot',
    'teeth': 'tooth',
    'geese': 'goose',
    'men': 'man',
    'women': 'woman',
    'lives': 'life',
    'leaves': 'leaf',
    'wolves': 'wolf'
  };
  
  if (word in irregularPlurals) {
    return irregularPlurals[word];
  }

  // Regular plural forms and other word forms
  if (word.endsWith('ies') && word.length > 4) {
    return word.slice(0, -3) + 'y';
  }
  if (word.endsWith('es') && word.length > 4) {
    if (word.endsWith('ches') || word.endsWith('shes') || word.endsWith('sses')) {
      return word.slice(0, -2);
    }
    return word.slice(0, -1);
  }
  if (word.endsWith('s') && !word.endsWith('ss') && word.length > 4) {
    return word.slice(0, -1);
  }
  if (word.endsWith('ing') && word.length > 5) {
    return word.slice(0, -3);
  }
  if (word.endsWith('ed') && word.length > 4) {
    return word.slice(0, -2);
  }
  if (word.endsWith('ly') && word.length > 4) {
    return word.slice(0, -2);
  }

  return word;
}

function filterCommonWords(words: string[]): string[] {
  const commonWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'from', 'up', 'about', 'into', 'over', 'after', 'beneath', 'under',
    'above', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall', 'should',
    'can', 'could', 'may', 'might', 'must', 'ought', 'i', 'you', 'he', 'she', 'it',
    'we', 'they', 'them', 'their', 'this', 'that', 'these', 'those', 'as', 'if',
    'when', 'where', 'why', 'how', 'all', 'any', 'some', 'no', 'not', 'yes',
    'him', 'his', 'her', 'mine', 'yours', 'ours', 'theirs',
    'my', 'your', 'our', 'its', 'here', 'there', 'now', 'then'
  ]);

  const processedWords: { [key: string]: string } = {};
  
  for (const word of words) {
    if (!commonWords.has(word.toLowerCase())) {
      const baseForm = getBaseForm(word);
      if (!(baseForm in processedWords) || word.length < processedWords[baseForm].length) {
        processedWords[baseForm] = word;
      }
    }
  }

  return Object.values(processedWords);
}

async function getWordData(word: string): Promise<WordData | null> {
  const apiKey = process.env.MERRIAM_WEBSTER_API_KEY;
  const baseUrl = "https://www.dictionaryapi.com/api/v3/references/collegiate/json";
  
  try {
    const response = await fetch(`${baseUrl}/${word}?key=${apiKey}`);
    const data = await response.json();
    
    if (!data?.[0] || typeof data[0] !== 'object') {
      return null;
    }
    
    const wordData = data[0];
    
    if (wordData.hwi?.prs?.[0]) {
      const pronunciation = wordData.hwi.prs[0];
      const phonetic = pronunciation.mw || '';
      const audioFile = pronunciation.sound?.audio || '';
      const definition = wordData.shortdef?.[0] || '';
      
      return {
        word,
        phonetic,
        audio_url: audioFile ? getAudioUrl(audioFile) : null,
        definition
      };
    }
    
    return null;
    
  } catch (error) {
    console.error(`Error fetching data for word '${word}':`, error);
    return null;
  }
}

function getAudioUrl(audioFile: string): string {
  let subdir: string;
  
  if (audioFile.startsWith('bix')) {
    subdir = 'bix';
  } else if (audioFile.startsWith('gg')) {
    subdir = 'gg';
  } else if (audioFile.startsWith('_')) {
    subdir = 'number';
  } else {
    subdir = audioFile[0];
  }
  
  return `https://media.merriam-webster.com/audio/prons/en/us/mp3/${subdir}/${audioFile}.mp3`;
}

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    
    // Split text into words and remove punctuation
    const words = text.split(/\s+/).map((word: string) => word.replace(/[.,!?()[\]{}":;]/g, ''));
    
    // Filter out common words and get unique base forms
    const uniqueWords = filterCommonWords(words);
    
    // Get dictionary data for each word
    const results = await Promise.all(
      uniqueWords.map(async word => {
        const wordData = await getWordData(word);
        return wordData;
      })
    );
    
    // Filter out null results
    const validResults = results.filter((result): result is WordData => result !== null);
    
    return NextResponse.json(validResults);
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
} 