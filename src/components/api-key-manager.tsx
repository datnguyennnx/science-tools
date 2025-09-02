'use client'

import { useState, useEffect, useRef } from 'react'
import { Key, Eye, EyeOff } from 'lucide-react'
import { OpenAI, Anthropic, Google, XAI } from '@lobehub/icons'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useSidebar } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { useAPIKeyManager } from '../hooks/useApiKeyManager'
import { APIService, APIProvider } from '../types/api-key'

const API_PROVIDERS: APIProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    placeholder: 'sk-...',
    icon: OpenAI,
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    placeholder: 'sk-ant-...',
    icon: Anthropic,
  },
  {
    id: 'google',
    name: 'Google',
    placeholder: 'AIza...',
    icon: Google,
  },
  {
    id: 'x-grok',
    name: 'xAI (Grok)',
    placeholder: 'xai-...',
    icon: XAI,
  },
]

interface ProviderInputProps {
  provider: APIProvider
  onSubmit: (service: APIService, apiKey: string) => Promise<void>
  loading: boolean
  isStored: boolean
}

const ProviderInput = ({ provider, onSubmit, loading, isStored }: ProviderInputProps) => {
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (apiKey.trim()) {
      await onSubmit(provider.id, apiKey.trim())
      setApiKey('')
    }
  }

  const IconComponent = provider.icon || Key

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-3">
        <IconComponent className="h-5 w-5" />
        <div className="flex-1">
          <Label htmlFor={`${provider.id}-key`} className="text-sm font-medium">
            {provider.name}
            {isStored && (
              <span className="ml-2 text-xs text-green-600 font-normal">(Configured)</span>
            )}
          </Label>
        </div>
      </div>

      <div className="flex space-x-2">
        <div className="flex-1 relative">
          <Input
            id={`${provider.id}-key`}
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder={provider.placeholder}
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
            onClick={() => setShowKey(!showKey)}
          >
            {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={!apiKey.trim() || loading}
          variant={isStored ? 'outline' : 'default'}
          size="sm"
        >
          {loading ? '...' : isStored ? 'Update' : 'Save'}
        </Button>
      </div>
    </div>
  )
}

const APIKeyForm = ({
  onSubmit,
  loading,
  refreshTrigger,
}: {
  onSubmit: (service: APIService, apiKey: string) => Promise<void>
  loading: boolean
  refreshTrigger: number
}) => {
  const [storedServices, setStoredServices] = useState<APIService[]>([])
  const apiKeyManagerRef = useRef(useAPIKeyManager())

  useEffect(() => {
    const loadStoredServices = async () => {
      const result = await apiKeyManagerRef.current.getServices()
      if (result.success && result.data) {
        setStoredServices(result.data)
      }
    }
    loadStoredServices()
  }, [refreshTrigger])

  return (
    <div className="space-y-6">
      {API_PROVIDERS.map(provider => (
        <ProviderInput
          key={provider.id}
          provider={provider}
          onSubmit={onSubmit}
          loading={loading}
          isStored={storedServices.includes(provider.id)}
        />
      ))}
    </div>
  )
}

interface APIKeyManagerProps {
  trigger?: React.ReactNode
}

export const APIKeyManager = ({ trigger }: APIKeyManagerProps) => {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const { state: sidebarState, isMobile } = useSidebar()

  const apiKeyManagerRef = useRef(useAPIKeyManager())

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 4000)
  }

  const handleStoreKey = async (service: APIService, apiKey: string) => {
    const result = await apiKeyManagerRef.current.storeAPIKey(service, apiKey)

    if (result.success) {
      showMessage('success', `API key for ${service} stored successfully`)
      setRefreshTrigger(prev => prev + 1)
    } else {
      showMessage('error', result.error || 'Failed to store API key')
    }
  }

  const isCollapsed = sidebarState === 'collapsed' && !isMobile

  const defaultTrigger = (
    <Button
      variant="ghost"
      size={isCollapsed ? 'icon' : 'sm'}
      className={cn(isCollapsed ? 'size-8' : 'w-full justify-start')}
      aria-label={isCollapsed ? 'API Keys' : undefined}
    >
      <Key className={cn('size-4', !isCollapsed && 'mr-2')} />
      {!isCollapsed && <span>API Keys</span>}
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Key Manager
          </DialogTitle>
          <DialogDescription>
            API keys are encrypted locally with device-specific keys and stored securely in your
            browser.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {message && (
            <Alert
              className={
                message.type === 'success'
                  ? 'border-green-200 bg-green-50'
                  : 'border-red-200 bg-red-50'
              }
            >
              <AlertDescription
                className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}
              >
                {message.text}
              </AlertDescription>
            </Alert>
          )}

          <APIKeyForm
            onSubmit={handleStoreKey}
            loading={apiKeyManagerRef.current.loading}
            refreshTrigger={refreshTrigger}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
