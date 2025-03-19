import {Link, LinkComponent, useMatches} from '@tanstack/react-router'
import {useMemo, useRef} from "react";
import {undefined} from "zod";


// todo::add forwardRef
export const StackNavigatorLink: LinkComponent<typeof Link> = ({to, params, search, hash, ...props}) => {
  const activeRoute = useMatches({
    select(routes) {
      return routes.some(
        route => route.fullPath === to
      ) ? routes : noopArray;
    }
  }).at(-1);

  const previousParsedLocation = usePrevious(useMemo(() => {
    if (!activeRoute) return undefined;

    return {
      to: activeRoute?.fullPath,
      params: activeRoute?.params,
      search: activeRoute?.search,
    }
  }, [activeRoute]));

  if (!activeRoute && previousParsedLocation) {
    // @ts-expect-error
    return <Link {...props} {...previousParsedLocation} />
  }
    // @ts-expect-error
  return <Link {...props} to={to} />

}


function usePrevious<T>(value: T): T | null {
  // initialise the ref with previous and current values
  const ref = useRef<{ value: T; prev: T | null }>({
    value: value,
    prev: null,
  })

  const current = ref.current.value

  // if the value passed into hook doesn't match what we store as "current"
  // move the "current" to the "previous"
  // and store the passed value as "current"
  if (value !== current) {
    ref.current = {
      value: value,
      prev: current,
    }
  }

  // return the previous value only
  return ref.current.prev
}

const noopArray = [] as const;