import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import MainLayout from "../layouts/MainLayout";

import {
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Bot,
  TrendingUp
} from "lucide-react";

import { setComplaints } from "../redux/slices/complaintSlice";
import Charts from "../Charts";

import "../styles/Dashboard.css";

export default function Dashboard() {
  const dispatch = useDispatch();

  const complaints =
    useSelector((state) => state.complaints?.list || []);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/complaints"
        );

        dispatch(setComplaints(response.data));
      } catch (error) {
        console.error(error);
      }
    };

    fetchComplaints();
  }, [dispatch]);

  const total = complaints.length;

  const open = complaints.filter(
    c => c.status === "Open"
  ).length;

  const resolved = complaints.filter(
    c => c.status === "Resolved"
  ).length;

  const pending = complaints.filter(
    c => c.status === "Pending"
  ).length;

  return (
    <MainLayout>

      <div className="dashboard">

        {/* KPI Cards */}

        <div className="stats-grid">

          <div className="stat-card">
            <FileText size={30}/>
            <h2>{total}</h2>
            <p>Total Complaints</p>
          </div>

          <div className="stat-card">
            <AlertCircle size={30}/>
            <h2>{open}</h2>
            <p>Open</p>
          </div>

          <div className="stat-card">
            <CheckCircle size={30}/>
            <h2>{resolved}</h2>
            <p>Resolved</p>
          </div>

          <div className="stat-card">
            <Clock size={30}/>
            <h2>{pending}</h2>
            <p>Pending</p>
          </div>

        </div>

        <div className="dashboard-content">

          {/* Charts */}

          <div className="chart-card">

            <h3>
              <TrendingUp size={20}/>
              Complaint Analytics
            </h3>

            {complaints.length > 0 ? (
              <Charts complaints={complaints}/>
            ) : (
              <p>No complaint data available.</p>
            )}

          </div>

          {/* AI Panel */}

          <div className="ai-panel">

            <div className="ai-header">
              <Bot size={24}/>
              <h3>AI Copilot</h3>
            </div>

            <div className="ai-card">

              <h4>Today's Insights</h4>

              <ul>
                <li>✔ High priority complaints detected.</li>
                <li>✔ Missing information in 3 complaints.</li>
                <li>✔ Review pending complaints.</li>
              </ul>

            </div>

            <button className="ai-btn">
              Generate AI Summary
            </button>

            <button className="ai-btn secondary">
              Predict Complaint Category
            </button>

          </div>

        </div>

      </div>

    </MainLayout>
  );
}