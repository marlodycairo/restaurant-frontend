import { createBrowserRouter } from "react-router";
import { AreaTables } from "../AreaTables";
import { Navbar } from "../components/Navbar";

const Layout = ({ children }) => (
  <>
    <Navbar />
    <div style={{ marginTop: "80px" }}>{children}</div>
  </>
);

export const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <Layout><AreaTables /></Layout>,
  },
]);
