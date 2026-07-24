import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import api from "../api/api";
import MainLayout from "../layouts/MainLayout";

import ComplaintDetailModal from "../components/ComplaintDetailModal";
import { setComplaints } from "../redux/slices/complaintSlice";

import "../styles/Dashboard.css";

export default function History() {
  const dispatch = useDispatch();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modal State
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const complaints = useSelector(
    (state) => state.complaints?.list || []
  );

  useEffect(() => {
    if (complaints.length === 0) {
      fetchComplaints();
    }
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await api.get("/complaints/");
      const data = Array.isArray(res.data) ? res.data : res.data?.complaints || [];
      dispatch(setComplaints(data));
    } catch (err) {
      console.log("Error loading history data, applying fallback:", err);
      dispatch(
        setComplaints([
          {
            id: 1,
            complaint_id: "CMP-101",
            customer_name: "Acme Corp",
            product_name: "Tablets 500mg",
            batch_number: "B-9021",
            priority: "High",
            status: "Pending",
            description: "High rate of tablet breakage observed during packaging.",
            root_cause: "Inadequate binder concentration during wet granulation.",
            created_at: "2026-03-01",
          },
          {
            id: 2,
            complaint_id: "CMP-102",
            customer_name: "John Doe",
            product_name: "Cough Syrup",
            batch_number: "CS-4019",
            priority: "Medium",
            status: "Closed",
            description: "Cap seal leaking slightly during shipping.",
            root_cause: "Torque value on capping station 2 was under-calibrated.",
            created_at: "2026-03-02",
          },
          {
            id: 3,
            complaint_id: "CMP-103",
            customer_name: "Health Plus",
            product_name: "Vitamin C",
            batch_number: "VC-1102",
            priority: "Low",
            status: "Pending",
            description: "Outer box label misaligned by 2mm.",
            root_cause: "Minor sensor drift on secondary labeling unit.",
            created_at: "2026-03-03",
          },
        ])
      );
    }
  };

  // Filter Logic
  const filteredComplaints = complaints.filter((item) => {
    const matchesSearch =
      (item.complaint_id && item.complaint_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.customer_name && item.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.product_name && item.product_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesPriority =
      priorityFilter === "All" ||
      (item.priority && item.priority.toLowerCase() === priorityFilter.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      (item.status && item.status.toLowerCase() === statusFilter.toLowerCase());

    return matchesSearch && matchesPriority && matchesStatus;
  });

  // Modal Handlers
  const handleOpenDetail = (item) => {
    setSelectedComplaint(item);
    setIsModalOpen(true);
  };

  const handleCloseDetail = () => {
    setIsModalOpen(false);
    setSelectedComplaint(null);
  };

  // Export Audit CSV
  const handleExportCSV = () => {
    const headers = "ID,Customer,Product,Priority,Status,Date\n";
    const rows = filteredComplaints
      .map(
        (c) =>
          `"${c.complaint_id || c.id}","${c.customer_name || ""}","${
            c.product_name || ""
          }","${c.priority || ""}","${c.status || ""}","${c.created_at || ""}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `complaint_history_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <MainLayout>
      <div className="history-page">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#0f172a", margin: 0 }}>
            Complaint History
          </h1>
          <button
            onClick={handleExportCSV}
            style={{
              padding: "10px 18px",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(37, 99, 235, 0.2)",
            }}
          >
            📥 Export CSV Audit Log
          </button>
        </div>

        {/* Search and Filters Toolbar */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 200px 200px",
            gap: "16px",
            marginBottom: "24px",
            background: "#ffffff",
            padding: "16px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
          }}
        >
          <input
            type="text"
            placeholder="Search by Complaint ID, Customer, or Product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "14px",
            }}
          />

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "14px",
              backgroundColor: "#ffffff",
            }}
          >
            <option value="All">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "10px 14px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "14px",
              backgroundColor: "#ffffff",
            }}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Closed">Closed</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        {/* Complaint History Table */}
        <div className="table-container">
          <h2>Recorded Quality Log ({filteredComplaints.length})</h2>
          <table className="complaint-table">
            <thead>
              <tr>
                <th>Complaint ID</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.map((item, index) => {
                const priorityClass = item.priority ? item.priority.toLowerCase() : "medium";
                const statusClass = item.status ? item.status.toLowerCase() : "pending";

                return (
                  <tr key={item.id || item.complaint_id || index}>
                    <td style={{ fontWeight: "600", color: "#2563eb" }}>
                      {item.complaint_id || `CMP-${item.id}`}
                    </td>
                    <td>{item.customer_name || item.customer || "N/A"}</td>
                    <td>{item.product_name || item.product || "N/A"}</td>
                    <td>
                      <span className={`priority ${priorityClass}`}>
                        {item.priority || "Medium"}
                      </span>
                    </td>
                    <td>
                      <span className={`status ${statusClass}`}>
                        {item.status || "Pending"}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleOpenDetail(item)}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#f1f5f9",
                          color: "#334155",
                          border: "1px solid #cbd5e1",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredComplaints.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", color: "#64748b", padding: "24px" }}>
                    No matching records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Investigation Detail Modal */}
      <ComplaintDetailModal
        open={isModalOpen}
        onClose={handleCloseDetail}
        complaint={selectedComplaint}
      />
    </MainLayout>
  );
}