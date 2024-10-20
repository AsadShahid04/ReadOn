import { NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'

export async function POST(request: Request) {
  const { text } = await request.json()

  return new Promise((resolve) => {
    const process = spawn('python', [
      path.join('src', 'app', 'phonics', 'phonetics.py'),
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
      console.error('Python script error:', data.toString())
    })

    process.on('close', (code) => {
      if (code !== 0) {
        console.error('Process failed:', errorOutput)
        resolve(NextResponse.json({ error: 'Process failed', details: errorOutput }, { status: 500 }))
      } else {
        try {
          const results = JSON.parse(output)
          resolve(NextResponse.json(results))
        } catch (error) {
          console.error('JSON parsing error:', error)
          resolve(NextResponse.json({ error: 'Invalid JSON output', details: output }, { status: 500 }))
        }
      }
    })
  })
}
