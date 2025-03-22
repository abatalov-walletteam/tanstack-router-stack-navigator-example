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

interface HistoryEntry {
  href: string;
  historyLocation: HistoryLocation;
}

export function createMemoryHistory(
  routeTree: AnyRoute,
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

      const historyLocation = prepareHistoryLocationAndStackNavigator(
        href,
        // todo::maybe `assignKeyAndIndex` is not needed for the custom history realisation?
        assignKeyAndIndex(
          index,
          typeof entry === "string" ? undefined : entry.state,
        ),
        utilityRouter,
        undefined,
      );

      return {
        href,
        historyLocation,
      };
    },
  );

  let index = opts.initialIndex
    ? Math.min(Math.max(opts.initialIndex, 0), historyEntries.length - 1)
    : historyEntries.length - 1;

  let previousStackNavigator =
    historyEntries[index].historyLocation.state.stackNavigator;

  const popStackNavigatorEntries = (
    stackNavigatorToPop: string | boolean | undefined,
  ) => {
    if (typeof stackNavigatorToPop !== "string") return;

    const { stackStartIndex = 0, stackEndIndex } = findStackNavigatorIndices(
      historyEntries,
      stackNavigatorToPop,
      undefined,
    );

    if (stackEndIndex !== undefined) {
      historyEntries.splice(
        stackStartIndex,
        stackEndIndex - stackStartIndex + 1,
      );

      index = Math.max(stackStartIndex - 1, 0);

      previousStackNavigator =
        historyEntries[index]?.historyLocation.state.stackNavigator;
    }
  };

  return createHistory({
    getLocation: () => {
      return historyEntries[index].historyLocation;
    },
    getLength: () => historyEntries.length,
    pushState: (href: string, state: ParsedHistoryState) => {
      const historyLocation = prepareHistoryLocationAndStackNavigator(
        href,
        state,
        utilityRouter,
        previousStackNavigator,
      );

      popStackNavigatorEntries(historyLocation.state.popStackNavigator);

      const stackNavigator = historyLocation.state.stackNavigator;

      if (stackNavigator && stackNavigator !== previousStackNavigator) {
        const { stackStartIndex = 0, stackEndIndex } =
          findStackNavigatorIndices(historyEntries, stackNavigator, href);

        if (stackEndIndex !== undefined) {
          const stackEntries = historyEntries.splice(
            stackStartIndex,
            stackEndIndex - stackStartIndex + 1,
          );
          stackEntries.splice(stackEntries.length - 1);
          historyEntries.push(...stackEntries);

          index = historyEntries.length - 1;
        }
      } else if (
        stackNavigator === previousStackNavigator &&
        href === historyEntries[index].href
      ) {
        historyEntries.splice(historyEntries.length - 1);
      }

      if (index < historyEntries.length - 1) {
        historyEntries.splice(index + 1);
      }

      historyEntries.push({
        href: href,
        historyLocation,
      });

      index = Math.max(historyEntries.length - 1, 0);

      previousStackNavigator = stackNavigator;
      recalculateIndices(historyEntries);
    },
    replaceState: (href: string, state: ParsedHistoryState) => {
      const historyLocation = prepareHistoryLocationAndStackNavigator(
        href,
        state,
        utilityRouter,
        previousStackNavigator,
      );

      popStackNavigatorEntries(historyLocation.state.popStackNavigator);

      const stackNavigator = historyLocation.state.stackNavigator;

      if (stackNavigator && stackNavigator !== previousStackNavigator) {
        const { stackStartIndex = 0, stackEndIndex } =
          findStackNavigatorIndices(historyEntries, stackNavigator, undefined);

        if (stackEndIndex !== undefined) {
          const stackEntries = historyEntries.splice(
            stackStartIndex,
            stackEndIndex - stackStartIndex + 1,
          );
          stackEntries.splice(stackEntries.length - 1);
          historyEntries[index] = {
            href: href,
            historyLocation,
          };
        }
      } else {
        historyEntries[index] = {
          href: href,
          historyLocation,
        };
      }

      previousStackNavigator = stackNavigator;
      recalculateIndices(historyEntries);
    },
    back: () => {
      index = Math.max(index - 1, 0);
    },
    forward: () => {
      index = Math.min(index + 1, historyEntries.length - 1);
    },
    go: (n) => {
      index = Math.min(Math.max(index + n, 0), historyEntries.length - 1);
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

function prepareHistoryLocationAndStackNavigator(
  href: string,
  state: ParsedHistoryState,
  utilityRouter: Router<any>,
  previousStackNavigator: string | undefined,
) {
  const historyLocation = parseHref(href, state);
  const stackNavigator =
    historyLocation.state.stackNavigator ??
    (getStackedNavigatorRoute(utilityRouter, historyLocation)?.id as
      | string
      | undefined);

  const popStackNavigator =
    typeof historyLocation.state.popStackNavigator === "string"
      ? historyLocation.state.popStackNavigator
      : typeof historyLocation.state.popStackNavigator === "boolean"
        ? previousStackNavigator
        : undefined;

  Object.assign(historyLocation, {
    state: {
      ...historyLocation.state,
      stackNavigator,
      popStackNavigator,
    } satisfies HistoryState,
  });

  return historyLocation;
}

function findStackNavigatorIndices(
  historyEntries: HistoryEntry[],
  stackNavigator: string,
  href: string | undefined,
) {
  let stackStartIndex;
  let stackEndIndex;
  // todo::is this still needed?
  let hrefStackEndIndex;

  for (let i = historyEntries.length - 1; i >= 0; i--) {
    const entry = historyEntries[i];

    if (entry.historyLocation.state.stackNavigator === stackNavigator) {
      if (stackEndIndex === undefined) {
        stackEndIndex = i;
      }
      if (i === 0) {
        stackStartIndex = i;
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

function recalculateIndices(entries: HistoryEntry[]) {
  entries.forEach((entry, index) => {
    if (entry.historyLocation.state) {
      entry.historyLocation.state[stateIndexKey] = index;
    }
  });
}
