import { NextResponse } from 'next/server';
import { fetchPhonetics } from '../../phonics/phonetics';

// Enhanced helper function to get base form of word
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
    'wolves': 'wolf',
    'knives': 'knife',
    'shelves': 'shelf',
    'selves': 'self',
    'phenomena': 'phenomenon',
    'criteria': 'criterion',
    'data': 'datum',
    'analyses': 'analysis',
    'theses': 'thesis',
    'diagnoses': 'diagnosis',
    'hypotheses': 'hypothesis',
    'crises': 'crisis',
    'matrices': 'matrix',
    'indices': 'index',
    'vertices': 'vertex',
    'appendices': 'appendix'
  };

  if (irregularPlurals[word]) {
    return irregularPlurals[word];
  }

  // Regular plural rules (in order of specificity)
  if (word.endsWith('ies')) {
    // babies -> baby, but not dies -> die
    if (word.length > 4) {
      return word.slice(0, -3) + 'y';
    }
  }
  
  if (word.endsWith('es')) {
    // matches -> match, boxes -> box
    if (word.endsWith('sses') || 
        word.endsWith('shes') || 
        word.endsWith('ches') || 
        word.endsWith('xes')) {
      return word.slice(0, -2);
    }
    // tomatoes -> tomato
    if (word.endsWith('oes') && word.length > 4) {
      return word.slice(0, -2);
    }
  }
  
  if (word.endsWith('s')) {
    // Regular plurals: cats -> cat
    // But don't change words like 'gas', 'bus', 'kiss'
    if (!word.endsWith('ss') && 
        !word.endsWith('us') && 
        word.length > 4) {
      return word.slice(0, -1);
    }
  }

  // Verb forms
  if (word.endsWith('ing')) {
    // running -> run, but not ring -> r
    if (word.length > 5) {
      // Double consonant: running -> run
      if (word[-4] === word[-5]) {
        return word.slice(0, -4);
      }
      // Regular: walking -> walk
      return word.slice(0, -3);
    }
  }

  if (word.endsWith('ed')) {
    // walked -> walk, stopped -> stop
    if (word.length > 4) {
      if (word[-3] === word[-4]) {
        return word.slice(0, -3);
      }
      return word.slice(0, -2);
    }
  }

  // Adverb to adjective
  if (word.endsWith('ly')) {
    // quickly -> quick, but not fly -> f
    if (word.length > 4) {
      return word.slice(0, -2);
    }
  }

  return word;
}

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    // Split text into words and clean them
    let words = text.split(/\s+/)
      .map((word: string) => word.toLowerCase().trim())
      .map((word: string) => word.replace(/[^a-zA-Z]/g, ''))
      .filter((word: string) => word.length > 3)
      .filter((word: string) => word);

    // Create a map to store unique base forms
    const baseFormMap = new Map<string, string>();
    
    // Process each word and keep only unique base forms
    words.forEach((word) => {
      const baseForm = getBaseForm(word);
      // Only keep the first occurrence of each base form
      if (!baseFormMap.has(baseForm)) {
        baseFormMap.set(baseForm, word);
      }
    });

    // Convert map values back to array
    const uniqueWords = Array.from(baseFormMap.values());

    // Get phonetics for unique words
    const phoneticsData = await Promise.all(
      uniqueWords.map(word => fetchPhonetics(word))
    );

    // Filter out any null results and sort alphabetically
    const validPhonetics = phoneticsData
      .filter((data): data is NonNullable<typeof data> => data !== null)
      .sort((a, b) => a.word.localeCompare(b.word));

    return NextResponse.json(validPhonetics);
  } catch (error) {
    console.error('Error in phonetics route:', error);
    return NextResponse.json({ error: 'Failed to process text' }, { status: 500 });
  }
} 