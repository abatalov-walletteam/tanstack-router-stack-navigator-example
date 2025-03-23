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
import { BottomNavigation } from "../components/BottomNavigation";

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
  const { stackNavigatorLocationsStore } = Route.useRouteContext();

  return (
    <StackResumeLinkProvider store={stackNavigatorLocationsStore}>
      <div className="min-h-screen flex flex-col relative">
        <main className="flex-1 overflow-auto pb-[60px]">
          <Outlet />
        </main>
        <div className="fixed bottom-0 left-0 right-0">
          <BottomNavigation />
        </div>
      </div>

      <TanStackRouterDevtools position="bottom-right" />
    </StackResumeLinkProvider>
  );
}
