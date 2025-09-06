// User prompt generation for AI JSON generation
export const SYSTEM_MESSAGE =
  'You are a professional JSON generator. Always return valid, well-formatted JSON that matches user requirements. Return ONLY the JSON object/array with no markdown formatting, no code blocks, and no explanations.'

export const USER_PROMPT_TEMPLATE = (
  userPrompt: string
): string => `You are a professional JSON generator. Based on this user request: "${userPrompt}"

Please generate valid, well-structured JSON that matches their description. Follow these guidelines:
- Return ONLY valid JSON (no markdown code blocks, no explanations, no backticks)
- Start directly with { or [ and end with } or ]
- Use appropriate data types (strings, numbers, booleans, arrays, objects)
- Include realistic sample data
- Structure the JSON logically based on the request
- Ensure proper nesting and relationships
- Use meaningful field names

User request: ${userPrompt}

IMPORTANT: Return ONLY the JSON object/array, nothing else. No markdown formatting, no code blocks, no explanations.`

// Clean the AI response to extract JSON from markdown code blocks
export const cleanJsonResponse = (responseText: string): string => {
  let cleanJsonText = responseText.trim()

  // Remove markdown code block syntax if present
  if (cleanJsonText.includes('```')) {
    const lines = cleanJsonText.split('\n')

    // Find the first line that starts with { or [
    const jsonStartIndex = lines.findIndex(line => {
      const trimmed = line.trim()
      return trimmed.startsWith('{') || trimmed.startsWith('[')
    })

    if (jsonStartIndex !== -1) {
      // Find the last line that ends with } or ]
      let jsonEndIndex = -1
      for (let i = lines.length - 1; i >= jsonStartIndex; i--) {
        const trimmed = lines[i].trim()
        if (trimmed.endsWith('}') || trimmed.endsWith(']')) {
          jsonEndIndex = i
          break
        }
      }

      if (jsonEndIndex !== -1) {
        cleanJsonText = lines.slice(jsonStartIndex, jsonEndIndex + 1).join('\n')
      } else {
        // Fallback: extract content between first { and last }
        const textContent = lines.slice(jsonStartIndex).join('\n')
        const startBrace = textContent.indexOf('{')
        const lastBrace = textContent.lastIndexOf('}')
        if (startBrace !== -1 && lastBrace !== -1 && lastBrace > startBrace) {
          cleanJsonText = textContent.substring(startBrace, lastBrace + 1)
        } else {
          // Ultimate fallback: just remove markdown markers
          cleanJsonText = lines
            .filter(line => !line.trim().startsWith('```') && !line.trim().endsWith('```'))
            .join('\n')
        }
      }
    } else {
      // No JSON structure found, try to clean up markdown
      cleanJsonText = lines.filter(line => !line.trim().startsWith('```')).join('\n')
    }
  }

  // Additional cleanup for common AI response patterns
  cleanJsonText = cleanJsonText
    .replace(/^```(?:json)?\s*/i, '') // Remove opening code block
    .replace(/\s*```$/, '') // Remove closing code block
    .replace(/^\s*[\r\n]+/, '') // Remove leading newlines
    .replace(/[\r\n]+\s*$/, '') // Remove trailing newlines
    .trim()

  return cleanJsonText
}
