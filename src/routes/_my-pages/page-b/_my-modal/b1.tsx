import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_my-pages/page-b/_my-modal/b1")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Link to="/page-b/b2">Go B2!</Link>;
}
