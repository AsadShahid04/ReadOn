import { NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'

export async function POST(request: Request): Promise<Response> {
  const { text } = await request.json()

  return new Promise<Response>((resolve) => {
    const process = spawn('python', [
      path.join('src', 'app', 'visualization', 'generate_images.py'),
    ])

    let output = ''
    let errorOutput = ''

    process.stdin.write(JSON.stringify({ text }))
    process.stdin.end()

    process.stdout.on('data', (data) => {
      output += data.toString()
    })

    process.stderr.on('data', (data) => {
      errorOutput += data.toString()
    })

    process.on('close', (code) => {
      console.log('Python script output:', output)
      console.error('Python script error output:', errorOutput)

      if (code !== 0) {
        console.error('Python script error:', errorOutput)
        resolve(NextResponse.json({ error: 'Process failed', details: errorOutput }, { status: 500 }))
      } else {
        try {
          const results = JSON.parse(output)
          resolve(NextResponse.json({ results, debug: { output, errorOutput } }))
        } catch (error) {
          console.error('JSON parsing error:', error)
          resolve(NextResponse.json({ error: 'Invalid JSON output', details: output, debug: { output, errorOutput } }, { status: 500 }))
        }
      }
    })
  })
}
