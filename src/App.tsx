import { RouterProvider } from "react-router";
import { appRouter } from "./router/app.router";

export default function App() {

  return <RouterProvider router={appRouter} />
}
