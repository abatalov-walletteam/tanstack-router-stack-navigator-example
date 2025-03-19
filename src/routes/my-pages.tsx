import {createFileRoute, Link, Outlet} from '@tanstack/react-router'

export const Route = createFileRoute('/my-pages')({
  component: LayoutComponent,
  staticData: {
    stackNavigator: true
  },
})

function LayoutComponent() {
  return (
    <div>
      <div>I'm a nested pathless layout</div>
      <div className="flex gap-2 border-b">
        <Link
          to="/my-pages/page-a"
          activeProps={{
            className: 'font-bold',
          }}
        >
          Go Page A
        </Link>
        <Link
          to="/my-pages/page-b"
          activeProps={{
            className: 'font-bold',
          }}
        >
          Go Page B
        </Link>
      </div>
      <div>
        <Outlet />
      </div>
    </div>
  )
}
