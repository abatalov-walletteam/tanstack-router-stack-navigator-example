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

    const stackNavigatorRoute = routesMatch.matchedRoutes
      .slice()
      .reverse()
      .find((route) => route.options.staticData?.stackNavigator);

    return stackNavigatorRoute?.id as string | undefined;
  }, [router, toOptions]);

  const stackLinksStore = useContext(StackResumeLinkContext);

  if (!stackLinksStore)
    throw new Error(
      "useStackNavigatorLastLinkOptions must be used within a StackNavigatorLinkToOptionsProvider",
    );

  const restoredLocation = useSyncExternalStore(
    useCallback(
      (callback) => stackLinksStore.subscribe(linkStackNavigator, callback),
      [linkStackNavigator],
    ),
    () => stackLinksStore.getSnapshot(linkStackNavigator),
    () => stackLinksStore.getSnapshot(linkStackNavigator),
  );

  const isLinkStackActive = useMatches({
    select: (routes) => {
      return routes.some((route) => {
        // `routeId` is not "compiled" route id without params
        return route.routeId === linkStackNavigator;
      });
    },
  });

  const restoredToOptions = useMemo(() => {
    if (isLinkStackActive) return;

    const parsedLocation =
      restoredLocation && createParsedLocation(restoredLocation);
    const { foundRoute, routeParams } = parsedLocation
      ? router.getMatchedRoutes(parsedLocation)
      : {};

    if (foundRoute) {
      return {
        to: foundRoute.to,
        from: undefined,
        mask: undefined,
        params: routeParams,
        search: parsedLocation?.search,
        state: restoredLocation?.state,
        hash: restoredLocation?.hash,
      } as T;
    }
  }, [isLinkStackActive]);

  return restoredToOptions ? { ...toOptions, ...restoredToOptions } : toOptions;
}
