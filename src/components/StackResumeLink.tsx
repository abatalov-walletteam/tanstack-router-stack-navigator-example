import {Link, LinkComponent, useMatches, useRouter} from '@tanstack/react-router'
import {forwardRef, useMemo, useRef} from "react";
import {undefined} from "zod";

// @ts-expect-error
export const StackResumeLink: LinkComponent<'a'> = forwardRef(function StackResumeLink(props, ref) {
  const router = useRouter();

  const linkStackNavigatorRoute = useMemo(() => {
    const routesMatch = router.getMatchedRoutes(
      router.buildLocation(
        // @ts-expect-error
        props
      )
    );

    return routesMatch.matchedRoutes.concat().reverse().find(route => route.options.staticData?.stackNavigator)
  }, [router, props])

  const activeRoute = useMatches({
    select(routes) {
      return routes.some(
        route => route.id === linkStackNavigatorRoute?.id
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
    return <Link {...props} {...previousParsedLocation} ref={ref} />
  }

  // @ts-expect-error
  return <Link {...props} ref={ref} />
});


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