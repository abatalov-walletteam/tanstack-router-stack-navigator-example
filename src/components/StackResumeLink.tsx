import { Link, LinkComponent, ToOptions } from "@tanstack/react-router";
import { ForwardedRef, forwardRef, useEffect } from "react";

import { useStackResumeLinkOptions } from "../hooks/useStackResumeLinkOptions";

// @ts-expect-error
export const StackResumeLink: LinkComponent<"a"> = forwardRef(
  function StackResumeLink(
    props: ToOptions,
    ref: ForwardedRef<HTMLAnchorElement>,
  ) {
    const toOptions = useStackResumeLinkOptions(props);

    return <Link {...toOptions} ref={ref} />;
  },
);
