import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Dashboard from "./pages/Dashboard";
import ComplaintForm from "./pages/ComplaintForm";
import ComplaintHistory from "./pages/ComplaintHistory";
import Analytics from "./pages/Analytics";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/complaint" element={<ComplaintForm />} />
        <Route path="/history" element={<ComplaintHistory />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3500} />
    </>
  );
}

export default App;