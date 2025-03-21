import {createFileRoute, Outlet} from '@tanstack/react-router'

export const Route = createFileRoute('/_my-pages/page-b/_my-modal')({
  component: RouteComponent,
  staticData: {
    stackNavigator: true,
  }
})

function RouteComponent() {
  return <Outlet />
}
