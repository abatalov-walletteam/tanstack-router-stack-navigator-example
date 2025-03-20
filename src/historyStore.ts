import {createContext, useContext, useSyncExternalStore} from 'react'

type Listener = () => void

export class HistoryStore {
  private _index: number = 0
  private listeners: Set<Listener> = new Set()

  subscribe = (listener: Listener) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private emitChange = () => {
    this.listeners.forEach(listener => listener())
  }

  get index(): number {
    return this._index
  }

  set index(newIndex: number) {
    if (newIndex !== this._index) {
      this._index = newIndex
      this.emitChange()
    }
  }
}

export const HistoryStoreContext = createContext<HistoryStore | null>(null)

export const useHistoryIndex = () => {
  const historyStore = useContext(HistoryStoreContext)!

  return useSyncExternalStore(
    historyStore.subscribe,
    () => historyStore.index
  )
} 