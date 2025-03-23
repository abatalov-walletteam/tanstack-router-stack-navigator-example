import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_my-pages/page-b/_my-modal/b3")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Link to="/page-b" state={{ popStackNavigator: true }}>
      Pop Sub Stack 🍭
    </Link>
  );
}
