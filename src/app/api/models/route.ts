import { NextResponse } from 'next/server'
import { API_ENDPOINTS } from '@/lib/config'

export async function GET() {
  try {
    const response = await fetch(API_ENDPOINTS.modelsDev, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to fetch models from Models.dev:', error)

    return NextResponse.json({ error: 'Failed to fetch models' }, { status: 500 })
  }
}
