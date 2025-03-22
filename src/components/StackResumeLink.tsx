import {
  Link,
  LinkComponent,
  useMatches,
  useRouter,
} from "@tanstack/react-router";
import { forwardRef, useMemo } from "react";
import { useStackResumeLinkOptions } from "./StackResumeLinkProvider";

// @ts-expect-error
export const StackResumeLink: LinkComponent<"a"> = forwardRef(
  function StackResumeLink(props, ref) {
    const router = useRouter();

    const linkStackNavigatorRoute = useMemo(() => {
      const routesMatch = router.getMatchedRoutes(
        router.buildLocation(
          // @ts-expect-error
          props,
        ),
      );

      return routesMatch.matchedRoutes
        .slice()
        .reverse()
        .find((route) => route.options.staticData?.stackNavigator);
    }, [router, props]);

    const isLinkStackActive = useMatches({
      select: (routes) =>
        routes.some((route) => route.id === linkStackNavigatorRoute?.id),
    });

    const { toOptions: previousParsedLocation } = useStackResumeLinkOptions(
      linkStackNavigatorRoute?.id,
    );

    if (!isLinkStackActive && previousParsedLocation) {
      // @ts-expect-error
      return <Link {...props} {...previousParsedLocation} ref={ref} />;
    }

    // @ts-expect-error
    return <Link {...props} ref={ref} />;
  },
);
