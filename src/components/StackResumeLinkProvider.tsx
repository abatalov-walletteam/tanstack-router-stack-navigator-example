import { createContext, useEffect } from "react";
import { ReactNode, useRouter } from "@tanstack/react-router";
import { HistoryLocation } from "@tanstack/history";
import { ParsedLocation } from "@tanstack/router-core";

type StackResumeLinkStore<T extends HistoryLocation> = {
  subscribe: (stackId: string | undefined, callback: () => void) => () => void;
  getSnapshot: (stackId: string | undefined) => T | undefined;
  set: (location: T) => void;
  delete: (stackId: string) => void;
};

export const createStackResumeLinkStore = (
  ...initialLocation: Array<HistoryLocation | ParsedLocation>
): StackResumeLinkStore<HistoryLocation> => {
  const state = new Map<string, HistoryLocation>();
  const routeListeners = new Map<string, Set<() => void>>();

  initialLocation.forEach((location) => {
    if (location.state.stackNavigator)
      state.set(
        location.state.stackNavigator,
        "searchStr" in location
          ? {
              href: location.href,
              pathname: location.pathname,
              search: location.searchStr,
              hash: location.hash,
              state: location.state,
            }
          : location,
      );
  });

  return {
    subscribe: (stackId, callback) => {
      if (stackId === undefined) return () => {};

      if (!routeListeners.has(stackId)) routeListeners.set(stackId, new Set());
      routeListeners.get(stackId)!.add(callback);
      return () => routeListeners.get(stackId)?.delete(callback);
    },
    getSnapshot: (stackId) => state.get(stackId!),
    set: (location) => {
      if (!location.state.stackNavigator) return;

      state.set(location.state.stackNavigator, location);
      routeListeners
        .get(location.state.stackNavigator)
        ?.forEach((listener) => listener());
    },
    delete: (stackId) => {
      state.delete(stackId);
      routeListeners.get(stackId)?.forEach((listener) => listener());
    },
  };
};

export const StackResumeLinkContext =
  createContext<StackResumeLinkStore<HistoryLocation> | null>(null);

export function StackResumeLinkProvider({
  children,
  store,
}: {
  children: ReactNode;
  store: StackResumeLinkStore<HistoryLocation>;
}) {
  const router = useRouter();

  useEffect(() => {
    const subscribe = router.history.subscribe;

    return subscribe(({ location }) => {
      store.set(location);

      if (typeof location.state.popStackNavigator === "string")
        store.delete(location.state.popStackNavigator);
    });
  }, [router.history.subscribe, store]);

  return (
    <StackResumeLinkContext.Provider value={store}>
      {children}
    </StackResumeLinkContext.Provider>
  );
}
