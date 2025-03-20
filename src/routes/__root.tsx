import {createRootRoute, Link, Outlet, useRouter} from '@tanstack/react-router'
import {TanStackRouterDevtools} from '@tanstack/react-router-devtools'
import {StackNavigatorLink} from "../components/StackNavigatorLink";
import {useHistoryIndex} from "../historyStore";

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: () => {
    return (
      <div>
        <p>This is the notFoundComponent configured on root route</p>
        <Link to="/">Start Over</Link>
      </div>
    )
  },
})

function RootComponent() {
  const router = useRouter()
  const index = useHistoryIndex();

  return (
    <>
      <div className="p-2 flex gap-2 text-lg border-b">
        <button
          disabled={!index}
          className="back-button" onClick={() => router.history.back()}>
          🔙
        </button>
        <StackNavigatorLink
          to="/"
          activeProps={{
            className: 'font-bold',
          }}
          activeOptions={{ exact: true }}
        >
          Home
        </StackNavigatorLink>{' '}
        <StackNavigatorLink
          to="/posts"
          activeProps={{
            className: 'font-bold',
          }}
        >
          Posts
        </StackNavigatorLink>{' '}
        <StackNavigatorLink
          to='/my-pages'
          activeProps={{
            className: 'font-bold',
          }}
        >
          Stack AB
        </StackNavigatorLink>{' '}
      </div>
      <hr />
      <Outlet />
      {/* Start rendering router matches */}
      <TanStackRouterDevtools position="bottom-right" />
    </>
  )
}
