import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(req: Request): Promise<Response> {
  try {
    const { text } = await req.json();
    
    // Path to Python script
    const scriptPath = path.join(process.cwd(), 'src', 'app', 'audiobook', 'texttospeech.py');
    
    return new Promise<Response>((resolve) => {
      const process = spawn('python', [scriptPath]);
      let outputData = '';
      let errorData = '';

      // Send input to Python script
      process.stdin.write(JSON.stringify({ text }));
      process.stdin.end();

      process.stdout.on('data', (data) => {
        outputData += data.toString();
      });

      process.stderr.on('data', (data) => {
        errorData += data.toString();
        console.error(`Python Error: ${data}`);
      });

      process.on('close', async (code) => {
        if (code !== 0 || errorData.includes('Error')) {
          console.error('Failed to generate speech:', errorData);
          resolve(NextResponse.json({ error: 'Failed to generate speech' }, { status: 500 }));
          return;
        }

        try {
          // Wait for file to be fully written
          await sleep(500);
          
          const audioFilePath = outputData.trim();
          const audioBuffer = await fs.readFile(audioFilePath);

          if (audioBuffer.length === 0) {
            throw new Error('Generated audio file is empty');
          }

          // Clean up old files asynchronously
          cleanupOldFiles(path.dirname(audioFilePath)).catch(console.error);

          resolve(new NextResponse(audioBuffer, {
            status: 200,
            headers: {
              'Content-Type': 'audio/mpeg',
              'Content-Length': audioBuffer.length.toString(),
            },
          }));
        } catch (error) {
          console.error('File operation error:', error);
          resolve(NextResponse.json({ 
            error: 'Failed to process audio file',
            details: error instanceof Error ? error.message : 'Unknown error'
          }, { status: 500 }));
        }
      });

      process.on('error', (error) => {
        console.error('Failed to start Python process:', error);
        resolve(NextResponse.json({ error: 'Failed to start process' }, { status: 500 }));
      });
    });
  } catch (error) {
    console.error('Error in text-to-speech route:', error);
    return NextResponse.json({ 
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

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

    const filesWithDates = await Promise.all(
      filePaths.map(async file => ({
        ...file,
        created: await file.created
      }))
    );

    const sortedFiles = filesWithDates.sort((a, b) => b.created - a.created);
    const filesToDelete = sortedFiles.slice(10);

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
