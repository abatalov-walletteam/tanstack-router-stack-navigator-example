import {createContext, useContext, useEffect, useRef, useSyncExternalStore} from 'react'
import type {ToOptions} from "@tanstack/router-core";
import {ReactNode, useMatches} from "@tanstack/react-router";

type StackResumeLinkStore = {
  subscribe: (routeId: string, callback: () => void) => () => void
  getSnapshot: (routeId: string) => ToOptions | undefined
  set: (stackRouteId: string, location: ToOptions) => void
}

export const createStackResumeLinkStore = (): StackResumeLinkStore => {
  const state = new Map<string, ToOptions>();
  const routeListeners = new Map<string, Set<() => void>>();

  return {
    subscribe: (routeId: string, callback: () => void) => {
      if (!routeListeners.has(routeId)) routeListeners.set(routeId, new Set());
      routeListeners.get(routeId)!.add(callback)

      return () => routeListeners.get(routeId)?.delete(callback)
    },
    getSnapshot: (routeId: string) => state.get(routeId),
    set: (stackRouteId: string, location: ToOptions) => {
      state.set(stackRouteId, location);
      routeListeners.get(stackRouteId)?.forEach(listener => listener())
    }
  }
}

const StackResumeLinkContext = createContext<StackResumeLinkStore | null>(null)

export function StackResumeLinkProvider({children, store}: {
  children: ReactNode;
  store: StackResumeLinkStore
}) {
  const stackNavigatorRoutes = useMatches({
    select(routes) {
      return routes.some(route => route.staticData.stackNavigator)
        ? routes : noopArray;
    }
  });

  const stackNavigatorRoute = stackNavigatorRoutes
    .slice().reverse().find(route => route.staticData.stackNavigator);

  const latestStackNavigatorRoutes = useRef(stackNavigatorRoutes);

  console.log('⚖️stackNavigatorRoute?.routeId', stackNavigatorRoute?.routeId)

  useEffect(() => () => {
    if (!stackNavigatorRoute?.routeId) return;
    const lastRoute = latestStackNavigatorRoutes.current.at(-1);

    if (lastRoute) {
      store.set(
        stackNavigatorRoute.routeId,
        // @ts-expect-error
        structuredClone({
          to: lastRoute.fullPath,
          search: lastRoute.search,
          params: lastRoute.params
        })
      )
    }
  }, [stackNavigatorRoute?.routeId]);

  useEffect(() => {
    latestStackNavigatorRoutes.current = stackNavigatorRoutes;
  })

  return (
    <StackResumeLinkContext.Provider value={store}>
      {children}
    </StackResumeLinkContext.Provider>
  )
}

export function useStackResumeLinkOptions(routeId: string) {
  const store = useContext(StackResumeLinkContext)

  if (!store) throw new Error('useStackNavigatorLastLinkOptions must be used within a StackNavigatorLinkToOptionsProvider')

  const toOptions = useSyncExternalStore(
    (callback) => store.subscribe(routeId, callback),
    () => store.getSnapshot(routeId),
    () => store.getSnapshot(routeId)
  );

  return {toOptions};
}

const noopArray = [] as const;