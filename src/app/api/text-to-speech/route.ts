import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(req: Request): Promise<Response> {
  try {
    const { text } = await req.json();
    const scriptPath = path.join(process.cwd(), 'src', 'app', 'api', 'text-to-speech', 'texttospeech.py');
    
    return new Promise<Response>((resolve) => {
      const pythonProcess = spawn('python3', [scriptPath]);
      let outputData = Buffer.from('');
      let errorData = '';

      pythonProcess.stdin.write(JSON.stringify({ text }));
      pythonProcess.stdin.end();

      pythonProcess.stdout.on('data', (data) => {
        outputData = Buffer.concat([outputData, data]);
      });

      pythonProcess.stderr.on('data', (data) => {
        errorData += data.toString();
        console.error(`Python Error: ${data}`);
      });

      pythonProcess.on('close', async (code) => {
        if (code !== 0 || errorData.includes('Error')) {
          console.error('Failed to generate speech:', errorData);
          resolve(NextResponse.json({ error: 'Failed to generate speech' }, { status: 500 }));
          return;
        }

        try {
          if (outputData.length === 0) {
            throw new Error('Generated audio data is empty');
          }

          resolve(new NextResponse(outputData, {
            status: 200,
            headers: {
              'Content-Type': 'audio/mpeg',
              'Content-Length': outputData.length.toString(),
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

      pythonProcess.on('error', (error) => {
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
