import React from 'react'

export const useMarkdownText = () => {
  // Helper function to extract raw text from React children
  const extractTextFromChildren = (children: React.ReactNode): string => {
    if (typeof children === 'string') {
      return children
    }

    if (Array.isArray(children)) {
      return children.map(extractTextFromChildren).join('')
    }

    if (
      React.isValidElement(children) &&
      (children.props as { children?: React.ReactNode }).children
    ) {
      return extractTextFromChildren((children.props as { children: React.ReactNode }).children)
    }

    return ''
  }

  return { extractTextFromChildren }
}
