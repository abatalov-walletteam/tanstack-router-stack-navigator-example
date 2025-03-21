import {createFileRoute} from '@tanstack/react-router'
import {StackResumeLink} from "../../../components/StackResumeLink";

export const Route = createFileRoute('/_my-pages/page-b/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <h4>I'm 📃 Page B (index)!</h4>
      <div><StackResumeLink to="/page-b/b1">📚 Open Page B SubStack</StackResumeLink></div>
    </div>
  );
}
