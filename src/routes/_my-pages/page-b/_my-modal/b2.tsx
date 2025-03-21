import {createFileRoute, Link} from '@tanstack/react-router'

export const Route = createFileRoute('/_my-pages/page-b/_my-modal/b2')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Link to="/page-b/b3">Go B3!</Link>
}
