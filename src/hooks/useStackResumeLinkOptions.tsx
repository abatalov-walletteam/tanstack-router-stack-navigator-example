import { ToOptions, useMatches, useRouter } from "@tanstack/react-router";
import { useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import { createParsedLocation } from "../memoryHistory";
import { StackResumeLinkContext } from "../components/StackResumeLinkProvider";

export function useStackResumeLinkOptions<T extends ToOptions>(
  toOptions: T,
): T {
  const router = useRouter();

  const linkStackNavigator = useMemo(() => {
    const routesMatch = router.getMatchedRoutes(
      router.buildLocation(toOptions),
    );

    return routesMatch.matchedRoutes
      .slice()
      .reverse()
      .find((route) => route.options.staticData?.stackNavigator)?.id as
      | string
      | undefined;
  }, [router, toOptions]);

  const stackLinksStore = useContext(StackResumeLinkContext);

  if (!stackLinksStore)
    throw new Error(
      "useStackNavigatorLastLinkOptions must be used within a StackNavigatorLinkToOptionsProvider",
    );

  const location = useSyncExternalStore(
    useCallback(
      (callback) => stackLinksStore.subscribe(linkStackNavigator, callback),
      [linkStackNavigator],
    ),
    () => stackLinksStore.getSnapshot(linkStackNavigator),
    () => stackLinksStore.getSnapshot(linkStackNavigator),
  );

  const isLinkStackActive = useMatches({
    select: (routes) => routes.some((route) => route.id === linkStackNavigator),
  });

  const restoredToOptions = useMemo(() => {
    if (isLinkStackActive) return;

    const route = location
      ? router.getMatchedRoutes(createParsedLocation(location)).foundRoute
      : undefined;

    if (route) {
      return {
        to: route.to,
        from: undefined,
        mask: undefined,
        params: route.options.params,
        search: route.options.search,
        state: location?.state,
        hash: location?.hash,
      } as T;
    }
  }, [isLinkStackActive]);

  return restoredToOptions ? { ...toOptions, ...restoredToOptions } : toOptions;
}
