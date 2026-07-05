import { Outlet } from "react-router-dom";
import "./MainLayout.css"

export default function MainLayout() {
  return (
    <>
      <header>
        <h1>SACE</h1>
      </header>

      <main>
        <Outlet />
      </main>

      <footer>
        © 2026
      </footer>
    </>
  );
}