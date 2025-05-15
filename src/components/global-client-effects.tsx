'use client' // Directive at the very top

import { FullscreenFlashMessage } from '@/components/fullscreen-flash-message'
import { useFlashMessageStore } from '@/stores/flash-message.store'
// import { Sparkles } from 'lucide-react' // No longer needed here as we pass the emoji directly

/**
 * GlobalClientEffects is a client component responsible for rendering global UI elements
 * driven by client-side state, like the FullscreenFlashMessage.
 * Global command listeners are now handled by CommandProvider.
 */
export function GlobalClientEffects() {
  const triggerCount = useFlashMessageStore(state => state.triggerCount)
  const message = useFlashMessageStore(state => state.message)

  return (
    <>
      <FullscreenFlashMessage
        trigger={triggerCount}
        message={message}
        // Pass the emoji directly. It will use the default styling from FullscreenFlashMessage if not overridden.
        // Or, we can style it here if needed: icon={<span className="text-9xl">🙏</span>}
        icon={<span className="text-[12rem]">🙏</span>} // Match the default size in FullscreenFlashMessage
        duration={2000}
      />
      {/* Other global client-side only components could go here */}
    </>
  )
}
