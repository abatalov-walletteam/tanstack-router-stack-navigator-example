import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import "./styles.css";
import { createMemoryHistory } from "./memoryHistory";
import { HistoryStore, HistoryStoreContext } from "./historyStore";
import { createStackResumeLinkStore } from "./components/StackResumeLinkProvider";

const historyStore = new HistoryStore();

// Set up a Router instance
const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultStaleTime: 5000,
  scrollRestoration: true,
  history: createMemoryHistory(routeTree, historyStore),
  context: {
    stackNavigatorLocationsStore: createStackResumeLinkStore(),
  },
});

// Register things for typesafety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

declare module "@tanstack/react-router" {
  interface StaticDataRouteOption {
    /**
     * Whether this route should be rendered in a stack navigator.
     */
    stackNavigator?: boolean;
  }
}

declare module "@tanstack/history" {
  interface HistoryState {
    __tempLocation?: HistoryLocation;
    __tempKey?: string;
    __hashScrollIntoViewOptions?: boolean | ScrollIntoViewOptions;
    stackNavigatorRouteId?: string;
  }
}

const rootElement = document.getElementById("app")!;

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <HistoryStoreContext value={historyStore}>
      <RouterProvider router={router} />
    </HistoryStoreContext>,
  );
}
