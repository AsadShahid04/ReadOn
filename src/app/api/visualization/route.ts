import { NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'

export async function POST(request: Request) {
  try {
    const { text } = await request.json()

    return new Promise((resolve) => {
      const process = spawn('python', [
        path.join('src', 'app', 'visualization', 'generate_images.py'),
      ])

      let stdoutData = '';
      let stderrData = '';

      // Set encoding to prevent buffer issues
      process.stdout.setEncoding('utf8');
      process.stderr.setEncoding('utf8');

      process.stdin.write(JSON.stringify({ text }));
      process.stdin.end();

      // Collect stdout data
      process.stdout.on('data', (data) => {
        stdoutData += data;
      });

      // Log progress updates
      process.stderr.on('data', (data) => {
        console.log('Python progress:', data.toString().trim());
      });

      process.on('close', (code) => {
        if (code !== 0) {
          console.error('Process failed:', stderrData);
          resolve(NextResponse.json({ 
            error: 'Failed to process text', 
            details: stderrData 
          }, { status: 500 }));
        } else {
          try {
            // Parse the complete stdout data once
            const results = JSON.parse(stdoutData.trim());
            resolve(NextResponse.json(results));
          } catch (error) {
            console.error('JSON parsing error:', error);
            resolve(NextResponse.json({ 
              error: 'Invalid JSON output', 
              details: stdoutData 
            }, { status: 500 }));
          }
        }
      });
    });
  } catch (error) {
    console.error('Error in visualization route:', error);
    return NextResponse.json({ error: 'Failed to process text' }, { status: 500 });
  }
}
