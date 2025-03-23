import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/profile")({
  component: RouteComponent,
  staticData: {
    stackNavigator: true,
  },
});

function RouteComponent() {
  return <Outlet />;
}
