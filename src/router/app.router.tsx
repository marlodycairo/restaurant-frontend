import { createBrowserRouter } from "react-router";
import { Layout } from "../components/Layout";
import { AreaTables } from "../AreaTables";

export const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <AreaTables /> },
      // { path: 'reservationsDetails', element: <ReservationsDetails />},
    ]
  },
]);
