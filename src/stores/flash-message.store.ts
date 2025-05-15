import { create, StateCreator } from 'zustand'

interface FlashMessageState {
  triggerCount: number
  message: string
  // The icon itself can be part of the state if it needs to be highly dynamic
  // and set by the command. For now, the command sets the message,
  // and AppClientEffects will provide a default icon to FullscreenFlashMessage.
  showFlash: (message?: string) => void
}

/**
 * Zustand store to manage the triggering of the fullscreen flash message.
 */
const flashMessageCreator: StateCreator<FlashMessageState> = set => ({
  triggerCount: 0,
  message: 'God bless you!!', // Default message, can be overridden by showFlash
  /**
   * Triggers the flash message. Increments triggerCount to activate the
   * FullscreenFlashMessage component and optionally updates the message.
   * @param newMessage The message to display. If undefined, uses the default.
   */
  showFlash: (newMessage?: string) =>
    set(state => ({
      triggerCount: state.triggerCount + 1,
      message: newMessage || 'God bless you!!',
    })),
})

export const useFlashMessageStore = create<FlashMessageState>(flashMessageCreator)
