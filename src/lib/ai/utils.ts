import { UIMessage } from 'ai'

// Create user message
export const createUserMessage = (content: string): UIMessage => ({
  id: `msg-${Date.now()}`,
  role: 'user',
  parts: [{ type: 'text', text: content }],
})

// Create system message
export const createSystemMessage = (content: string): UIMessage => ({
  id: `sys-${Date.now()}`,
  role: 'system',
  parts: [{ type: 'text', text: content }],
})

// Create assistant message
export const createAssistantMessage = (content: string): UIMessage => ({
  id: `asst-${Date.now()}`,
  role: 'assistant',
  parts: [{ type: 'text', text: content }],
})
