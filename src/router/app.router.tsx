import { createBrowserRouter } from "react-router";
import { Layout } from "../components/Layout";
import { AreaTables } from "../AreaTables";
import { ReservationDetailByTable } from "../reservations/reservations.detailsByTable";

export const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <AreaTables /> },
      // { path: 'reservationsDetails', element: <ReservationsDetails />},
      { path: 'reservationDetailByTable/:idTable', element: <ReservationDetailByTable />}
    ]
  },
]);
