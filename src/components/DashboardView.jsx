import React from 'react';

export default function DashboardView() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Quality Analytics Dashboard</h1>
        <p className="text-sm text-slate-500">Overview of complaint trends, product defect categories, and triage performance.</p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Complaints</p>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-2">142</h3>
          <span className="text-xs text-emerald-600 font-medium mt-1 inline-block">↑ 12% from last month</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Triage</p>
          <h3 className="text-3xl font-extrabold text-amber-600 mt-2">8</h3>
          <span className="text-xs text-slate-500 font-medium mt-1 inline-block">Requires AI/QA review</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Investigations Open</p>
          <h3 className="text-3xl font-extrabold text-blue-600 mt-2">24</h3>
          <span className="text-xs text-blue-600 font-medium mt-1 inline-block">In progress</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg. Resolution Time</p>
          <h3 className="text-3xl font-extrabold text-slate-900 mt-2">4.2 Days</h3>
          <span className="text-xs text-emerald-600 font-medium mt-1 inline-block">↓ 0.5 days faster</span>
        </div>
      </div>

      {/* Secondary Chart / Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4">Top Complaint Categories</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                <span>Product Defect - Discoloration</span>
                <span>45%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                <span>Packaging Seal Failure</span>
                <span>30%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: '30%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                <span>Labeling / Dosage Discrepancy</span>
                <span>25%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-2">AIVOA Copilot Insights</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              The AI model has detected a correlation between batch <span className="font-mono font-semibold text-slate-700">AMX240602</span> and primary packaging moisture reports. Automated root-cause flagging is active.
            </p>
          </div>
          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-900">Run Automated Batch Correlation Scan</span>
            <button onClick={() => alert('Scan initiated via FastAPI background worker.')} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition">
              Run Scan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}