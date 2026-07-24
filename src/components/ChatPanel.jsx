import { useState } from "react";
import { useDispatch } from "react-redux";
import api from "../api/api";
import { updateComplaintData } from "../slices/complaintSlice";

export default function ChatPanel() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleSend = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    try {
      // Send raw text to your FastAPI agent
      const formData = new FormData();
      formData.append("text", input);
      
      const response = await api.post("/api/extract-complaint", formData);
      
      // Dispatch the new AI-extracted data to Redux
      // This immediately updates your History table and Analytics
      dispatch(updateComplaintData(response.data));
      
      setInput(""); // Clear the input field
      alert("AI successfully analyzed the complaint!");
    } catch (err) {
      console.error("AI Processing Error:", err);
      alert("Error: Ensure your backend is running and the endpoint is reachable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-panel" style={{ padding: "20px", border: "1px solid #e2e8f0", borderRadius: "12px", background: "#f8fafc" }}>
      <h3>AI Copilot</h3>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a complaint like: 'Batch B-9021 of Tablets had high breakage...'"
        style={{ width: "100%", height: "100px", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
        disabled={loading}
      />
      <button 
        onClick={handleSend} 
        disabled={loading}
        style={{ marginTop: "10px", padding: "10px 20px", backgroundColor: "#0f172a", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}
      >
        {loading ? "Analyzing with AI..." : "Process via AI"}
      </button>
    </div>
  );
}