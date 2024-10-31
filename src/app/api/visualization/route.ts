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

      let output = ''
      let errorOutput = ''

      process.stdout.setEncoding('utf8')
      process.stderr.setEncoding('utf8')

      process.stdin.write(JSON.stringify({ text }))
      process.stdin.end()

      process.stdout.on('data', (data) => {
        output += data
      })

      process.stderr.on('data', (data) => {
        console.log('Python progress:', data.toString().trim())
      })

      process.on('close', (code) => {
        if (code !== 0) {
          console.error('Process failed:', errorOutput)
          resolve(NextResponse.json({ 
            error: 'Failed to process text', 
            details: errorOutput 
          }, { status: 500 }))
        } else {
          try {
            const results = JSON.parse(output.trim())
            resolve(NextResponse.json(results))
          } catch (error) {
            console.error('JSON parsing error:', error)
            resolve(NextResponse.json({ 
              error: 'Invalid JSON output', 
              details: output 
            }, { status: 500 }))
          }
        }
      })
    })
  } catch (error) {
    console.error('Error in visualization route:', error)
    return NextResponse.json({ error: 'Failed to process text' }, { status: 500 })
  }
}
