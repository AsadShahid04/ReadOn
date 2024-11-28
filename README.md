# Read On - AI-Powered Reading Assistant

Read On is an interactive web application designed to enhance reading comprehension and learning through various AI-powered tools. The application processes user-provided text and offers multiple learning modalities to help users better understand and engage with the content.

## Features

### 1. Phonics Practice
- Identifies unique words from the input text
- Provides phonetic breakdowns using Merriam-Webster's dictionary API
- Includes audio pronunciation for each word
- Presents words as interactive flashcards with pronunciation guides
- Filters out common words to focus on vocabulary building

### 2. Reading Comprehension
- Generates dynamic multiple-choice questions based on text length
- Creates one question per 200 characters (maximum 15 questions)
- Provides immediate feedback on answers
- Tracks progress with a scoring system
- Celebrates completion with congratulatory messages
- Uses Google's Gemini AI for intelligent question generation

### 3. Word Visualization
- Creates visual representations of text using DALL-E 3
- Processes text by paragraphs or sentences
- Maintains context between generated images
- Provides a visual narrative of the text
- Helps visual learners better understand the content

### 4. Read Aloud
- Converts text to speech using OpenAI's TTS model
- Highlights words in sync with audio playback
- Provides play/pause and skip functionality
- Maintains high-quality audio output
- Helps with pronunciation and reading flow

### 5. Interactive Learning
- Combines all features into one comprehensive learning experience
- Visualizes text with AI-generated images
- Provides word-by-word phonetic and pronunciation assistance
- Includes comprehension questions with instant feedback
- Creates an immersive learning environment

## API Keys Setup

### 1. OpenAI API Key
1. Visit [OpenAI's website](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to the [API Keys section](https://platform.openai.com/api-keys)
4. Click "Create new secret key"
5. Copy the key (Note: it will only be shown once)
6. Used for DALL-E 3 image generation and text-to-speech features

### 2. Google Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key
5. Used for generating comprehension questions

### 3. Merriam-Webster Dictionary API Key
1. Visit [Merriam-Webster's Developer Center](https://dictionaryapi.com/)
2. Create a new account or sign in
3. Navigate to "My Keys" in your account dashboard
4. Request a key for the "Collegiate Dictionary"
5. Copy the API key
6. Used for phonetic breakdowns and pronunciations

## Environment Setup

1. Create a `.env` file in the root directory of the project
2. Add your API keys:
```env
OPENAI_API_KEY=your_openai_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
MERRIAM_WEBSTER_API_KEY=your_dictionary_api_key_here
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/read-on.git
cd read-on
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Create necessary directories:
```bash
mkdir -p public/audio_files
```

5. Run the development server:
```bash
npm run dev
```

## Usage

1. Enter or paste text in the main input area (3500 character limit)
2. Choose from one of five learning tools:
   - Phonics Practice for word pronunciation
   - Reading Comprehension for understanding
   - Word Visualization for visual learning
   - Read Aloud for audio learning
   - Interactive Learning for a comprehensive experience
3. Each tool provides interactive features to enhance the learning experience

## Important Notes

- The OpenAI API is a paid service. You will need to add billing information to your account.
- The Gemini API is currently free but has usage limits.
- The Merriam-Webster API is free for non-commercial use with usage limits.
- Keep your API keys secure and never commit them to version control.
- Consider implementing rate limiting for production use.
- Audio files are automatically cleaned up in development
- In production, temporary files are stored in /tmp

## Security

- Updated to use requests>=2.32.0 to fix session verification issues
- Updated to Pillow>=10.3.0 to address buffer overflow vulnerability
- All Python dependencies use specific versions to ensure compatibility
- API routes use python3 command for better compatibility

## Troubleshooting

If you encounter issues:
1. Verify all API keys are correctly set in your `.env` file
2. Ensure all dependencies are installed with correct versions
3. Check the console for error messages
4. Verify your API keys have sufficient permissions and credits
5. Check your internet connection for API access
6. Ensure the public/audio_files directory exists
7. Make sure python3 is installed and accessible from command line