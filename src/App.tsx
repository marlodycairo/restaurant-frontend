import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { AreaTables } from "./AreaTables";
import { Navbar } from "./components/Navbar";
//import { appRouter } from "./router/app.router";
import { ProductsList } from "./products/products.list";


export default function App() {

  return (
    <BrowserRouter>
      <Navbar />
      <div style={{ marginTop: "80px" }}>
        <Routes>
          <Route path="/" element={<AreaTables />} />
          <Route path="/productsList" element={<ProductsList />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
