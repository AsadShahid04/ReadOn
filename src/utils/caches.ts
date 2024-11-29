import LRUCache from './LRUCache';

// Types for cached data
export interface VisualizationResult {
  segment: string;
  image_data: string;
  segment_type: 'paragraph' | 'sentence';
}

export interface Question {
  question: string;
  choices: {
    text: string;
    isCorrect: boolean;
  }[];
}

export interface WordData {
  word: string;
  phonetic: string;
  audio_url: string | null;
  definition: string;
}

// Cache instances
export const visualizationCache = new LRUCache<string, { results: VisualizationResult[] }>(50);
export const audiobookCache = new LRUCache<string, ArrayBuffer>(100); // Cache audio data
export const comprehensionCache = new LRUCache<string, { questions: Question[] }>(100);
export const phoneticsCache = new LRUCache<string, WordData[]>(200); // Moved from phonics module

// Helper functions
export const getCachedVisualization = (text: string) => visualizationCache.get(text);
export const getCachedAudio = (text: string) => audiobookCache.get(text);
export const getCachedQuestions = (text: string) => comprehensionCache.get(text);
export const getCachedPhonetics = (text: string) => phoneticsCache.get(text);

// Debug function
export const debugCaches = () => {
  console.log('=== Cache Statistics ===');
  console.log('Visualization Cache:');
  visualizationCache.debug();
  console.log('Audiobook Cache:');
  audiobookCache.debug();
  console.log('Comprehension Cache:');
  comprehensionCache.debug();
  console.log('Phonetics Cache:');
  phoneticsCache.debug();
}; 