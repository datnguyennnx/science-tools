import { create, StateCreator } from 'zustand'
import { createDynamicModelOptions, getConfiguredProviders, ModelOption } from '@/lib/ai/providers'
import { ERROR_MESSAGES } from '@/lib/config'

// Base state interface
export interface AIState {
  modelOptions: ModelOption[]
  loading: boolean
  error: string | null
  lastUpdated: number | null
  configuredProviders: string[]
  selectedModel: string
}

// Actions interface
export interface AIActions {
  loadModels: () => Promise<void>
  refreshModels: () => Promise<void>
  updateConfiguredProviders: (providers: string[]) => Promise<void>
  setSelectedModel: (model: string) => void
  clearError: () => void
  reset: () => void
}

// Pure function to create initial state
const createInitialAIState = (): AIState => ({
  modelOptions: [],
  loading: false,
  error: null,
  lastUpdated: null,
  configuredProviders: [],
  selectedModel: '',
})

// Pure function for model loading logic
const createModelLoader = (
  set: (state: Partial<AIState>) => void,
  get: () => AIState & AIActions
) => ({
  loadModels: async () => {
    const { loading } = get()
    if (loading) return // Prevent concurrent loads

    set({ loading: true, error: null })

    try {
      const configuredProviders = await getConfiguredProviders()
      const modelOptions = await createDynamicModelOptions(configuredProviders)

      set({
        modelOptions,
        loading: false,
        error: null,
        lastUpdated: Date.now(),
        configuredProviders,
        // Set default selection if not already set
        selectedModel:
          get().selectedModel || (modelOptions.length > 0 ? modelOptions[0].value : ''),
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.unknownError

      set({
        modelOptions: [],
        loading: false,
        error: errorMessage,
        lastUpdated: Date.now(),
        selectedModel: get().selectedModel,
      })
    }
  },
})

// Pure function for model refresh logic
const createModelRefresher = (
  set: (state: Partial<AIState>) => void,
  get: () => AIState & AIActions
) => ({
  refreshModels: async () => {
    set({ lastUpdated: null }) // Clear cache timestamp
    await get().loadModels()
  },
})

// Pure function for provider management
const createProviderManager = (
  set: (state: Partial<AIState>) => void,
  get: () => AIState & AIActions
) => ({
  updateConfiguredProviders: async (providers: string[]) => {
    set({ configuredProviders: providers })
    await get().loadModels()
  },
})

// Pure function for model selection
const createModelSelector = (set: (state: Partial<AIState>) => void) => ({
  setSelectedModel: (model: string) => {
    set({ selectedModel: model })
  },
})

// Pure function for error management
const createErrorManager = (set: (state: Partial<AIState>) => void) => ({
  clearError: () => {
    set({ error: null })
  },
})

// Pure function for store reset
const createStoreResetter = (set: (state: Partial<AIState>) => void) => ({
  reset: () => {
    set(createInitialAIState())
  },
})

// Functional composition of all AI store modules
const createAIStoreComposition = (): StateCreator<AIState & AIActions> => (set, get) => ({
  ...createInitialAIState(),
  ...createModelLoader(set, get as () => AIState & AIActions),
  ...createModelRefresher(set, get as () => AIState & AIActions),
  ...createProviderManager(set, get as () => AIState & AIActions),
  ...createModelSelector(set),
  ...createErrorManager(set),
  ...createStoreResetter(set),
})

// Types are already exported above with interface declarations

/**
 * Zustand store for global AI state management using functional composition
 * Handles model loading, caching, and provider filtering through composable modules
 */
export const useAIStore = create<AIState & AIActions>(createAIStoreComposition())

// Initialize AI store on app start (only in browser)
if (typeof window !== 'undefined') {
  // Load models when the app starts
  useAIStore.getState().loadModels()
}

// Export individual hooks for specific state/actions
export const useAIModels = () => useAIStore(state => state.modelOptions)
export const useAILoading = () => useAIStore(state => state.loading)
export const useAIError = () => useAIStore(state => state.error)
export const useAISelectedModel = () => useAIStore(state => state.selectedModel)
export const useAISetSelectedModel = () => useAIStore(state => state.setSelectedModel)
