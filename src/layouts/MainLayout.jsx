import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

import "../styles/MainLayout.css";

export default function MainLayout({ children }) {
  return (
    <div className="layout">

      <Sidebar />

      <main className="main-content">

        <Header />

        <section className="page-content">
          {children}
        </section>

      </main>

    </div>
  );
}