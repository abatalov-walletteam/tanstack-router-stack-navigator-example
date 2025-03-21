import {
  createHistory,
  HistoryLocation,
  HistoryState,
  ParsedHistoryState,
  parseHref,
  RouterHistory
} from "@tanstack/history";
import type {AnyRoute, ParsedLocation} from "@tanstack/router-core";
import {createRouter, defaultParseSearch, Router} from "@tanstack/react-router";
import {HistoryStore} from './historyStore';

interface HistoryEntry {
  href: string;
  historyLocation: HistoryLocation
}

export function createMemoryHistory(
  routeTree: AnyRoute,
  historyStore: HistoryStore,
  opts: {
    initialEntries: Array<string>
    initialIndex?: number
  } = {
    initialEntries: ['/'],
  },
): RouterHistory {
  const utilityRouter = createRouter({
    routeTree,
  });

  /**
   *   const states = entries.map((entry, index) =>
   *     assignKeyAndIndex(index, {
   *       stackNavigatorRouteId: getStackedNavigatorRoute(
   *         utilityRouter,
   *         entry,
   *       )?.id
   *     }),
   *   );
   */

  const historyEntries: HistoryEntry[] = opts.initialEntries.map((href, index) => {
    // todo::maybe `assignKeyAndIndex` is not needed?
    const historyLocation = parseHref(href, assignKeyAndIndex(index, undefined));
    const stackNavigatorRoute = getStackedNavigatorRoute(utilityRouter, historyLocation);

    assignStackNavigatorRouteIdState(
      historyLocation,
      stackNavigatorRoute,
    );

    return ({
      href,
      historyLocation,
    });
  });

  historyStore.index = opts.initialIndex
    ? Math.min(Math.max(opts.initialIndex, 0), historyEntries.length - 1)
    : historyEntries.length - 1;

  let previousStackNavigatorRouteId = historyEntries[historyStore.index].historyLocation.state.stackNavigatorRouteId;

  console.log(
    '🚐 Initial history entries', historyEntries
  );

  return createHistory({
    getLocation: () => {
      console.log('📬', historyEntries.map(entry => entry.href))
      return historyEntries[historyStore.index].historyLocation;
    },
    getLength: () => historyEntries.length,
    pushState: (href: string, state: ParsedHistoryState) => {
      const historyLocation = parseHref(href, state);
      const stackNavigatorRoute = getStackedNavigatorRoute(
        utilityRouter,
        historyLocation,
      );

      assignStackNavigatorRouteIdState(
        historyLocation,
        stackNavigatorRoute,
      );

      let stackStartIndex;
      let stackEndIndex;
      let hrefStackEndIndex;

      if (stackNavigatorRoute?.id &&
        stackNavigatorRoute.id !== previousStackNavigatorRouteId) {

        for (let i = historyEntries.length - 1; i >= 0; i--) {
          const entry = historyEntries[i];

          if (entry.historyLocation.state.stackNavigatorRouteId === stackNavigatorRoute.id) {
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

        if (stackEndIndex !== undefined) {
          stackStartIndex = stackStartIndex ?? 0;

          const stackEntries = historyEntries.splice(stackStartIndex, (stackEndIndex - stackStartIndex) + 1);
          stackEntries.splice(stackEntries.length - 1);
          historyEntries.push(...stackEntries);

          console.log(
            '🪄',
            {
              historyEntries: structuredClone(historyEntries),
              stackEntries: structuredClone(stackEntries)
            },
            {stackStartIndex, stackEndIndex, hrefStackEndIndex: hrefStackEndIndex}
          );

          historyStore.index = historyEntries.length - 1;
        }
      } else if (
        stackNavigatorRoute?.id === previousStackNavigatorRouteId &&
        href === historyEntries[historyStore.index].href
      ) {
        historyEntries.splice(historyEntries.length - 1);
      }

      console.log(
        'Stacked Navigator',
        stackNavigatorRoute ? '✅' : '✖️',
        stackNavigatorRoute?.id,
      )

      previousStackNavigatorRouteId = stackNavigatorRoute?.id;

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
      const historyLocation = parseHref(href, state);
      const stackNavigatorRoute = getStackedNavigatorRoute(
        utilityRouter,
        historyLocation,
      );

      assignStackNavigatorRouteIdState(
        historyLocation,
        stackNavigatorRoute,
      );

      if (stackNavigatorRoute?.id &&
        stackNavigatorRoute.id !== previousStackNavigatorRouteId) {

        let stackStartIndex;
        let stackEndIndex;

        for (let i = historyEntries.length - 1; i >= 0; i--) {
          const entry = historyEntries[i];

          if (entry.historyLocation.state.stackNavigatorRouteId === stackNavigatorRoute.id) {
            if (stackEndIndex === undefined) {
              stackEndIndex = i;
            }
          } else if (stackEndIndex !== undefined) {
            stackStartIndex = i + 1;
            break;
          }
        }

        if (stackEndIndex !== undefined) {
          stackStartIndex = stackStartIndex ?? 0;

          const stackEntries = historyEntries.splice(stackStartIndex, (stackEndIndex - stackStartIndex) + 1);
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

      previousStackNavigatorRouteId = stackNavigatorRoute?.id;
    },
    back: () => {
      historyStore.index = Math.max(historyStore.index - 1, 0);
    },
    forward: () => {
      historyStore.index = Math.min(historyStore.index + 1, historyEntries.length - 1);
    },
    go: (n) => {
      historyStore.index = Math.min(Math.max(historyStore.index + n, 0), historyEntries.length - 1);
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
    searchStr: historyLocation.search
  }
}

function getStackedNavigatorRoute(utilityRouter: Router<any>, location: HistoryLocation): AnyRoute | undefined {
  const matchingRoute = utilityRouter.getMatchedRoutes(createParsedLocation(location));

  const reversedMatchedRouted = matchingRoute.matchedRoutes.concat().reverse();

  return reversedMatchedRouted.find(
    route =>
      route.options.staticData && 'stackNavigator' in route.options.staticData &&
      route.options.staticData.stackNavigator
  );
}

const stateIndexKey = '__TSR_index';

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
function assignStackNavigatorRouteIdState(historyLocation: HistoryLocation, stackNavigatorRoute: AnyRoute | undefined) {
  Object.assign(historyLocation, {
    state: {
      ...historyLocation.state,
      stackNavigatorRouteId: stackNavigatorRoute?.id,
    }
  })
}