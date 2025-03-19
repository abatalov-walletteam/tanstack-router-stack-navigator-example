import {createHistory, HistoryState, ParsedHistoryState, parseHref, RouterHistory} from "@tanstack/history/src";

export function createMemoryHistory(
  opts: {
    initialEntries: Array<string>
    initialIndex?: number
  } = {
    initialEntries: ['/'],
  },
): RouterHistory {
  const entries = opts.initialEntries
  let index = opts.initialIndex
    ? Math.min(Math.max(opts.initialIndex, 0), entries.length - 1)
    : entries.length - 1
  const states = entries.map((_entry, index) =>
    assignKeyAndIndex(index, undefined),
  )

  const getLocation = () => parseHref(entries[index]!, states[index])

  return createHistory({
    getLocation,
    getLength: () => entries.length,
    pushState: (path: string, state: ParsedHistoryState) => {
      // Removes all subsequent entries after the current index to start a new branch
      if (index < entries.length - 1) {
        entries.splice(index + 1)
        states.splice(index + 1)
      }
      states.push(state)
      entries.push(path)
      index = Math.max(entries.length - 1, 0)
    },
    replaceState: (path: string, state: ParsedHistoryState) => {
      states[index] = state
      entries[index] = path
    },
    back: () => {
      index = Math.max(index - 1, 0)
    },
    forward: () => {
      index = Math.min(index + 1, entries.length - 1)
    },
    go: (n) => {
      index = Math.min(Math.max(index + n, 0), entries.length - 1)
    },
    createHref: (path: string) => path,
  })
}

const stateIndexKey = '__TSR_index'

function assignKeyAndIndex(index: number, state: HistoryState | undefined) {
  if (!state) {
    state = {} as HistoryState
  }
  return {
    ...state,
    key: createRandomKey(),
    [stateIndexKey]: index,
  } as ParsedHistoryState
}

function createRandomKey() {
  return (Math.random() + 1).toString(36).substring(7)
}

