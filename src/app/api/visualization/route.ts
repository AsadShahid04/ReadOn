import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(request: Request): Promise<Response> {
  try {
    const { text } = await request.json();
    
    // Path to Python script
    const scriptPath = path.join(process.cwd(), 'src', 'app', 'visualization', 'generate_images.py');
    
    return new Promise((resolve, reject) => {
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

      process.on('close', (code) => {
        if (code !== 0) {
          console.error(`Process exited with code ${code}`);
          resolve(NextResponse.json(
            { error: 'Failed to generate images', details: errorData },
            { status: 500 }
          ));
        } else {
          try {
            const results = JSON.parse(outputData);
            resolve(NextResponse.json(results));
          } catch (e) {
            resolve(NextResponse.json(
              { error: 'Failed to parse Python output' },
              { status: 500 }
            ));
          }
        }
      });
    });
  } catch (error) {
    console.error('Error in visualization route:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
