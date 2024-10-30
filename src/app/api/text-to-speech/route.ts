import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(req: Request) {
  const { text } = await req.json();

  try {
    const scriptPath = path.join(process.cwd(), 'src', 'app', 'audiobook', 'texttospeech.py');
    const { stdout, stderr } = await execAsync(`python "${scriptPath}" "${text}"`);

    // Log both stdout and stderr for debugging
    console.log('Python stdout:', stdout);
    console.log('Python stderr:', stderr);

    // Get the file path from stdout
    const audioFilePath = stdout.trim();

    if (!audioFilePath || stderr.includes('Error generating speech')) {
      console.error('Failed to generate speech file');
      return NextResponse.json({ error: 'Failed to generate speech' }, { status: 500 });
    }

    try {
      // Wait a short time to ensure file is fully written
      await sleep(500);

      // Check if file exists
      await fs.access(audioFilePath);
      
      // Read the file
      const audioBuffer = await fs.readFile(audioFilePath);
      console.log('Audio buffer size:', audioBuffer.length);

      if (audioBuffer.length === 0) {
        throw new Error('Generated audio file is empty');
      }

      // Return the audio buffer
      const response = new NextResponse(audioBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': audioBuffer.length.toString(),
        },
      });

      // Clean up old files asynchronously (keep last 10 files)
      cleanupOldFiles(path.dirname(audioFilePath)).catch(console.error);

      return response;
    } catch (fileError: any) {
      console.error('File operation error:', fileError);
      return NextResponse.json({ 
        error: 'Failed to process audio file',
        details: fileError?.message || 'Unknown file error'
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error in text-to-speech route:', error);
    return NextResponse.json({ 
      error: 'Failed to generate speech',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}

// Function to clean up old files, keeping the most recent ones
async function cleanupOldFiles(dirPath: string) {
  try {
    const files = await fs.readdir(dirPath);
    const filePaths = files
      .filter(file => file.endsWith('.mp3'))
      .map(file => ({
        name: file,
        path: path.join(dirPath, file),
        created: fs.stat(path.join(dirPath, file)).then(stat => stat.birthtimeMs)
      }));

    // Get file creation times
    const filesWithDates = await Promise.all(
      filePaths.map(async file => ({
        ...file,
        created: await file.created
      }))
    );

    // Sort by creation time (newest first) and remove old files
    const sortedFiles = filesWithDates.sort((a, b) => b.created - a.created);
    const filesToDelete = sortedFiles.slice(10); // Keep the 10 most recent files

    // Delete old files
    for (const file of filesToDelete) {
      try {
        await fs.unlink(file.path);
        console.log(`Cleaned up old audio file: ${file.name}`);
      } catch (error) {
        console.warn(`Failed to delete old file ${file.name}:`, error);
      }
    }
  } catch (error) {
    console.error('Error cleaning up old files:', error);
  }
}
