import { NextResponse } from 'next/server'

import { sendMessage } from '@/services/email'

interface IEmailForm {
  [key: string]: string
}

export const POST = async (request: Request) => {
  const EMAIL_SERVICE_SECRET = process.env.EMAIL_SERVICE_SECRET || ''

  if (!EMAIL_SERVICE_SECRET) {
    return NextResponse.json({ status: false, error: 'Email service not configured' }, { status: 500 })
  }

  try {
    const body: IEmailForm = await request.json()

    const newFormBody = new FormData()
    newFormBody.append('access_key', EMAIL_SERVICE_SECRET)

    for (const key in body) {
      newFormBody.append(key, body[key])
    }

    const response = await sendMessage(newFormBody)
    return NextResponse.json({ status: true, data: response }, { status: 200 })
  } catch (error: any) {
    console.error('Email API Error:', error.message || error)
    return NextResponse.json({ status: false, error: error.message || 'Failed to send email' }, { status: 400 })
  }
}
