import { createBrowserRouter } from "react-router";
import { AreaTables } from "../AreaTables";
import { ProductsList } from "../products/products.list";
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
  {
    path: "/productsList",
    element: <Layout><ProductsList /></Layout>,
  },
]);
