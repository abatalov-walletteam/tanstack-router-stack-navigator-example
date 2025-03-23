import {
  createRootRouteWithContext,
  Link,
  Outlet,
  useCanGoBack,
  useRouter,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { StackResumeLink } from "../components/StackResumeLink";
import {
  createStackResumeLinkStore,
  StackResumeLinkProvider,
} from "../components/StackResumeLinkProvider";

export const Route = createRootRouteWithContext<{
  stackNavigatorLocationsStore: ReturnType<typeof createStackResumeLinkStore>;
}>()({
  component: RootComponent,
  context: ({ location }) => {
    return {
      stackNavigatorLocationsStore: createStackResumeLinkStore(location),
    };
  },
  notFoundComponent: () => {
    return (
      <div>
        <p>This is the notFoundComponent configured on root route</p>
        <Link to="/">Start Over</Link>
      </div>
    );
  },
});

function RootComponent() {
  const router = useRouter();
  const { stackNavigatorLocationsStore } = Route.useRouteContext();
  const canGoBack = useCanGoBack();

  return (
    <StackResumeLinkProvider store={stackNavigatorLocationsStore}>
      <div className="p-2 flex gap-2 text-lg border-b">
        <button
          disabled={!canGoBack}
          className="back-button"
          onClick={() => router.history.back()}
        >
          🔙
        </button>
        <StackResumeLink
          to="/"
          activeProps={{
            className: "font-bold",
          }}
          activeOptions={{ exact: true }}
        >
          Home
        </StackResumeLink>{" "}
        <StackResumeLink
          to="/posts"
          activeProps={{
            className: "font-bold",
          }}
        >
          Posts
        </StackResumeLink>{" "}
        <StackResumeLink
          to="/page-a"
          activeProps={{
            className: "font-bold",
          }}
        >
          Stack AB
        </StackResumeLink>
      </div>
      <hr />
      <Outlet />
      <TanStackRouterDevtools position="bottom-right" />
    </StackResumeLinkProvider>
  );
}
