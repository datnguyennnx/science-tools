'use client'

import React from 'react'
import { MarkdownEditor } from './components/MarkdownEditor'

export default function MarkdownPage() {
  return (
    <section aria-label="Markdown Editor and Preview" className="p-4">
      <MarkdownEditor />
    </section>
  )
}
