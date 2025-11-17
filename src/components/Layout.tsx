import { Navbar } from "./Navbar"
import { Outlet } from "react-router";

export const Layout = () => {
  return (
    <>
      <Navbar />
      <div style={{ marginTop: '80px'}} >
        {/* Aquí se renderizan las rutas hijas */}
        <Outlet />
      </div>
    </>
  );
}
