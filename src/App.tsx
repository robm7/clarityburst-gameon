import { Route, Switch } from "wouter";
import Home from "./pages/Home";
import GameOn from "./pages/GameOn";
const NotFound = () => <div className="p-8 text-2xl">404</div>;

export default function App() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/gameon" component={GameOn} />
      <Route component={NotFound} />
    </Switch>
  );
}
