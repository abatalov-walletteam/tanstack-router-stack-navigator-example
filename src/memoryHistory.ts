import {
  createHistory,
  HistoryLocation,
  HistoryState,
  ParsedHistoryState,
  parseHref,
  RouterHistory,
} from "@tanstack/history";
import type { AnyRoute, ParsedLocation } from "@tanstack/router-core";
import {
  createRouter,
  defaultParseSearch,
  Router,
} from "@tanstack/react-router";
import { HistoryStore } from "./historyStore";

interface HistoryEntry {
  href: string;
  historyLocation: HistoryLocation;
}

export function createMemoryHistory(
  routeTree: AnyRoute,
  historyStore: HistoryStore,
  opts: {
    initialEntries: Array<
      string | { href: string; state: Pick<HistoryState, "stackNavigator"> }
    >;
    initialIndex?: number;
  } = {
    initialEntries: ["/"],
  },
): RouterHistory {
  const utilityRouter = createRouter({
    routeTree,
  });

  const historyEntries: HistoryEntry[] = opts.initialEntries.map(
    (entry, index) => {
      const href = typeof entry === "string" ? entry : entry.href;
      // todo::maybe `assignKeyAndIndex` is not needed for the custom history realisation?
      const historyLocation = parseHref(
        href,
        assignKeyAndIndex(
          index,
          typeof entry === "string" ? undefined : entry.state,
        ),
      );

      assignStackNavigatorRouteIdState(
        historyLocation,
        getStackedNavigatorRoute(utilityRouter, historyLocation)?.id,
      );

      return {
        href,
        historyLocation,
      };
    },
  );

  historyStore.index = opts.initialIndex
    ? Math.min(Math.max(opts.initialIndex, 0), historyEntries.length - 1)
    : historyEntries.length - 1;

  let previousStackNavigator =
    historyEntries[historyStore.index].historyLocation.state.stackNavigator;

  return createHistory({
    getLocation: () => {
      return historyEntries[historyStore.index].historyLocation;
    },
    getLength: () => historyEntries.length,
    pushState: (href: string, state: ParsedHistoryState) => {
      const { historyLocation, stackNavigator } =
        prepareHistoryLocationAndStackNavigator(href, state, utilityRouter);

      if (stackNavigator && stackNavigator !== previousStackNavigator) {
        const {
          stackStartIndex = 0,
          stackEndIndex,
          hrefStackEndIndex,
        } = findStackNavigatorIndices(historyEntries, stackNavigator, href);

        if (stackEndIndex !== undefined) {
          const stackEntries = historyEntries.splice(
            stackStartIndex,
            stackEndIndex - stackStartIndex + 1,
          );
          stackEntries.splice(stackEntries.length - 1);
          historyEntries.push(...stackEntries);

          historyStore.index = historyEntries.length - 1;
        }
      } else if (
        stackNavigator === previousStackNavigator &&
        href === historyEntries[historyStore.index].href
      ) {
        historyEntries.splice(historyEntries.length - 1);
      }

      previousStackNavigator = stackNavigator;

      if (historyStore.index < historyEntries.length - 1) {
        historyEntries.splice(historyStore.index + 1);
      }

      historyEntries.push({
        href: href,
        historyLocation,
      });

      historyStore.index = Math.max(historyEntries.length - 1, 0);
    },
    replaceState: (href: string, state: ParsedHistoryState) => {
      const { historyLocation, stackNavigator } =
        prepareHistoryLocationAndStackNavigator(href, state, utilityRouter);

      if (stackNavigator && stackNavigator !== previousStackNavigator) {
        const { stackStartIndex = 0, stackEndIndex } =
          findStackNavigatorIndices(historyEntries, stackNavigator, undefined);

        if (stackEndIndex !== undefined) {
          const stackEntries = historyEntries.splice(
            stackStartIndex,
            stackEndIndex - stackStartIndex + 1,
          );
          stackEntries.splice(stackEntries.length - 1);
          historyEntries[historyStore.index] = {
            href: href,
            historyLocation,
          };
        }
      } else {
        historyEntries[historyStore.index] = {
          href: href,
          historyLocation,
        };
      }

      previousStackNavigator = stackNavigator;
    },
    back: () => {
      historyStore.index = Math.max(historyStore.index - 1, 0);
    },
    forward: () => {
      historyStore.index = Math.min(
        historyStore.index + 1,
        historyEntries.length - 1,
      );
    },
    go: (n) => {
      historyStore.index = Math.min(
        Math.max(historyStore.index + n, 0),
        historyEntries.length - 1,
      );
    },
    createHref: (path: string) => path,
  });
}

function createParsedLocation(
  historyLocation: HistoryLocation,
): ParsedLocation {
  return {
    ...historyLocation,
    search: defaultParseSearch(historyLocation.search),
    searchStr: historyLocation.search,
  };
}

function getStackedNavigatorRoute(
  utilityRouter: Router<any>,
  location: HistoryLocation,
): AnyRoute | undefined {
  const matchingRoute = utilityRouter.getMatchedRoutes(
    createParsedLocation(location),
  );

  const reversedMatchedRouted = matchingRoute.matchedRoutes.concat().reverse();

  return reversedMatchedRouted.find(
    (route) =>
      route.options.staticData &&
      "stackNavigator" in route.options.staticData &&
      route.options.staticData.stackNavigator,
  );
}

const stateIndexKey = "__TSR_index";

function assignKeyAndIndex(index: number, state: HistoryState | undefined) {
  if (!state) {
    state = {} as HistoryState;
  }
  return {
    ...state,
    key: createRandomKey(),
    [stateIndexKey]: index,
  } as ParsedHistoryState;
}

function createRandomKey() {
  return (Math.random() + 1).toString(36).substring(7);
}

function assignStackNavigatorRouteIdState(
  historyLocation: HistoryLocation,
  stackNavigatorRoute: string | undefined,
) {
  Object.assign(historyLocation, {
    state: {
      ...historyLocation.state,
      stackNavigator: stackNavigatorRoute,
    } satisfies HistoryState,
  });
}

function prepareHistoryLocationAndStackNavigator(
  href: string,
  state: ParsedHistoryState,
  utilityRouter: Router<any>,
) {
  const historyLocation = parseHref(href, state);
  const stackNavigator =
    historyLocation.state.stackNavigator ??
    (getStackedNavigatorRoute(utilityRouter, historyLocation)?.id as
      | string
      | undefined);

  assignStackNavigatorRouteIdState(historyLocation, stackNavigator);

  return { historyLocation, stackNavigator };
}

function findStackNavigatorIndices(
  historyEntries: HistoryEntry[],
  stackNavigator: string,
  href: string | undefined,
) {
  let stackStartIndex;
  let stackEndIndex;
  let hrefStackEndIndex;

  for (let i = historyEntries.length - 1; i >= 0; i--) {
    const entry = historyEntries[i];

    if (entry.historyLocation.state.stackNavigator === stackNavigator) {
      if (stackEndIndex === undefined) {
        stackEndIndex = i;
      }

      if (hrefStackEndIndex === undefined && entry.href === href) {
        hrefStackEndIndex = i;
      }
    } else if (stackEndIndex !== undefined) {
      stackStartIndex = i + 1;
      break;
    }
  }

  return {
    stackStartIndex,
    stackEndIndex,
    hrefStackEndIndex,
  };
}
