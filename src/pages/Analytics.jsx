import React from "react";
import { useSelector } from "react-redux";
import MainLayout from "../layouts/MainLayout";
import Charts from "../Charts";

export default function Analytics() {
  const complaints = useSelector(
    (state) => state.complaints?.list || []
  );

  return (
    <MainLayout>
      <div className="analytics-container">
        <h1>Analytics</h1>
        <Charts complaints={complaints} />
      </div>
    </MainLayout>
  );
}