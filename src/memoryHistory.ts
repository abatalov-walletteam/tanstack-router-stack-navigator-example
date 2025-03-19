import {createHistory, HistoryState, ParsedHistoryState, parseHref, RouterHistory} from "@tanstack/history";
import type {AnyRoute} from "@tanstack/router-core";
import {createRouter} from "@tanstack/react-router";
import type {ParsedLocation} from "@tanstack/router-core";
import {Router} from "@tanstack/react-router";
import {AnySchema} from "@tanstack/router-core/dist/esm/validators";

export function createMemoryHistory(
  routeTree: AnyRoute,
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

  const entries = opts.initialEntries;

  let index = opts.initialIndex
    ? Math.min(Math.max(opts.initialIndex, 0), entries.length - 1)
    : entries.length - 1;

  let previousStackNavigatorRoute = getStackedNavigatorRoute(
    utilityRouter,
    entries[index],
  );

  const states = entries.map((entry, index) =>
    assignKeyAndIndex(index, {
      stackNavigatorRouteId: getStackedNavigatorRoute(
        utilityRouter,
        entry,
      )?.id
    }),
  );

  console.log(
    '🚐 Initial states', states
  )

  const getLocation = () => parseHref(entries[index]!, states[index])

  return createHistory({
    getLocation,
    getLength: () => entries.length,
    pushState: (pathname: string, state: ParsedHistoryState) => {

      const stackNavigatorRoute = getStackedNavigatorRoute(
        utilityRouter,
        pathname,
      );

      let stackStartIndex;
      let stackEndIndex;
      let pathnameStackEndIndex;

      if (stackNavigatorRoute?.id &&
        stackNavigatorRoute.id !== previousStackNavigatorRoute?.id) {

        for (let i = states.length - 1; i >= 0; i--) {
          const stateItem = states[i];

          if (stateItem.stackNavigatorRouteId === stackNavigatorRoute.id) {
            if (stackEndIndex === undefined) {
              stackEndIndex = i;
            }

            if (pathnameStackEndIndex === undefined && entries[i] === pathname) {
              pathnameStackEndIndex = i;
            }
          }
          else if (stackEndIndex !== undefined) {
            stackStartIndex = i + 1;
            break;
          }
        }

        if (stackEndIndex !== undefined) {
          stackStartIndex = stackStartIndex ?? 0;

          const stackEntries = entries.splice(stackStartIndex, (stackEndIndex - stackStartIndex) + 1);
          stackEntries.splice(stackEntries.length - 1);
          entries.push(...stackEntries);

          console.log(
            '🪄',
            {
              entries: structuredClone(entries),
              stackEntries: structuredClone(stackEntries)
            },
            { stackStartIndex, stackEndIndex, pathnameStackEndIndex }
          );

          const stackStates = states.splice(stackStartIndex, (stackEndIndex - stackStartIndex) + 1);
          stackStates.splice(stackStates.length - 1)
          states.push(...stackStates);

          index = entries.length - 1;
        }
      }
      else if (
        stackNavigatorRoute?.id === previousStackNavigatorRoute?.id &&
        pathname === entries[index]
      ) {
        entries.splice(entries.length - 1)
        states.splice(states.length - 1)
      }

      console.log(
        'Stacked Navigator',
        stackNavigatorRoute ? '✅' : '✖️',
        stackNavigatorRoute?.id,
      )

      previousStackNavigatorRoute = stackNavigatorRoute;

      // Removes all subsequent entries after the current index to start a new branch
      if (index < entries.length - 1) {
        entries.splice(index + 1)
        states.splice(index + 1)
      }
      states.push({
        ...state,
        stackNavigatorRouteId: stackNavigatorRoute?.id,
      })
      entries.push(pathname)
      index = Math.max(entries.length - 1, 0)
      console.log('📬🫸', entries)
    },
    replaceState: (pathname: string, state: ParsedHistoryState) => {
      const stackNavigatorRoute = getStackedNavigatorRoute(
        utilityRouter,
        pathname,
      );

      if (stackNavigatorRoute?.id &&
        stackNavigatorRoute.id !== previousStackNavigatorRoute?.id) {

        let stackStartIndex;
        let stackEndIndex;

        for (let i = states.length - 1; i >= 0; i--) {
          const stateItem = states[i];

          if (stateItem.stackNavigatorRouteId === stackNavigatorRoute.id) {
            if (stackEndIndex === undefined) {
              stackEndIndex = i;
            }
          }
          else if (stackEndIndex !== undefined) {
            stackStartIndex = i + 1;
            break;
          }
        }

        if (stackEndIndex !== undefined) {
          stackStartIndex = stackStartIndex ?? 0;

          const stackEntries = entries.splice(stackStartIndex, (stackEndIndex - stackStartIndex) + 1);
          stackEntries.splice(stackEntries.length - 1);
          entries[index] = pathname;

          const stackStates = states.splice(stackStartIndex, (stackEndIndex - stackStartIndex) + 1);
          stackStates.splice(stackStates.length - 1);
          states[index] = {
            ...state,
            stackNavigatorRouteId: stackNavigatorRoute?.id,
          };
        }
      } else {
        states[index] = {
          ...state,
          stackNavigatorRouteId: stackNavigatorRoute?.id,
        }
        entries[index] = pathname
      }

      console.log('📬📌', entries)
      previousStackNavigatorRoute = stackNavigatorRoute;
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

function getStackedNavigatorRoute(utilityRouter: Router<any>, pathname: string, search: AnySchema = {}): AnyRoute | undefined {
  const matchingRoute = utilityRouter.getMatchedRoutes({
    pathname,
    search: {},
  } as ParsedLocation)

  const reversedMatchedRouted = matchingRoute.matchedRoutes.concat().reverse()

  return reversedMatchedRouted.find(
    route =>
      route.options.staticData && 'stackNavigator' in route.options.staticData &&
      route.options.staticData.stackNavigator
  );
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

