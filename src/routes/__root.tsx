import {
  createRootRouteWithContext,
  Link,
  Outlet,
  useRouter,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { StackResumeLink } from "../components/StackResumeLink";
import { useHistoryIndex } from "../historyStore";
import {
  createStackResumeLinkStore,
  StackResumeLinkProvider,
} from "../components/StackResumeLinkProvider";

export const Route = createRootRouteWithContext<{
  stackNavigatorLocationsStore: ReturnType<typeof createStackResumeLinkStore>;
}>()({
  component: RootComponent,
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
  const index = useHistoryIndex();
  const { stackNavigatorLocationsStore } = Route.useRouteContext();

  return (
    <StackResumeLinkProvider store={stackNavigatorLocationsStore}>
      <div className="p-2 flex gap-2 text-lg border-b">
        <button
          disabled={!index}
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
