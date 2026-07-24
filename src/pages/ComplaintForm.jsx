import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Paperclip, Send, Sparkles, FileText } from "lucide-react";

import MainLayout from "../layouts/MainLayout";
import { initialFormState } from "../initialFormState";
import { addComplaint } from "../redux/slices/complaintSlice";
import { extractComplaintData } from "../api/complaintApi";
import {
  simulateTextExtraction,
  simulateCorrectionParse,
  simulateFileExtraction,
} from "../utils/complaintExtraction";

import "./ComplaintForm.css";

let msgId = 0;
const nextId = () => `m${++msgId}`;

export default function ComplaintForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);

  const [formData, setFormData] = useState(initialFormState);
  const [readyToCommit, setReadyToCommit] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: nextId(),
      sender: "ai",
      text: "Ready to process new complaints. You can paste the raw email from the customer, or upload a PDF of the complaint report. I will extract the data and run the initial risk assessment.",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null); // 0-100 or null

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking, uploadProgress]);

  const applyExtractedData = (partial) => {
    setFormData((prev) => ({ ...prev, ...partial }));
    setReadyToCommit(true);
  };

  const pushMessage = (sender, text) => {
    setMessages((prev) => [...prev, { id: nextId(), sender, text }]);
  };

  const isFirstExtraction = () => !readyToCommit;

  const handleFieldChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Try the real backend first (see src/api/complaintApi.js); fall back to the
  // local heuristic simulation if there's no server running yet.
  const requestExtraction = async (text, file) => {
    try {
      const result = await extractComplaintData(text, file);
      if (result && typeof result === "object" && Object.keys(result).length) {
        return { data: result, viaBackend: true };
      }
      throw new Error("empty backend response");
    } catch {
      if (file) {
        const profile = simulateFileExtraction();
        return { data: profile.data, viaBackend: false, fileProfile: profile };
      }
      const { data } = simulateTextExtraction(text);
      return { data, viaBackend: false };
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text || isThinking) return;

    pushMessage("user", text);
    setInputText("");
    setIsThinking(true);

    if (isFirstExtraction()) {
      const { data } = await requestExtraction(text, null);
      await new Promise((r) => setTimeout(r, 700));
      applyExtractedData(data);
      setIsThinking(false);
      pushMessage(
        "ai",
        "Complaint parsed successfully. I've extracted the product details, mapped the batch information, and generated an initial risk assessment for the reported issue."
      );
    } else {
      const { changedFields, data } = simulateCorrectionParse(text);
      await new Promise((r) => setTimeout(r, 500));
      setIsThinking(false);

      if (changedFields.length) {
        setFormData((prev) => ({ ...prev, ...data }));
        const summary = changedFields
          .map((f) => `the ${f.label} to "${f.value}"`)
          .join(" and ");
        pushMessage("ai", `Got it. I have updated ${summary} in the form.`);
      } else {
        pushMessage(
          "ai",
          "I've noted that, but couldn't confidently map it to a specific field — feel free to edit the form directly, or tell me the field name explicitly (e.g. \"batch number is X\")."
        );
      }
    }
  };

  const handleFileButtonClick = () => fileInputRef.current?.click();

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    pushMessage("file", file.name);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((p) => {
        if (p === null) return null;
        const next = p + Math.random() * 22 + 10;
        return next >= 96 ? 96 : next;
      });
    }, 220);

    const { data, fileProfile } = await requestExtraction(null, file);
    clearInterval(interval);
    setUploadProgress(100);
    await new Promise((r) => setTimeout(r, 250));
    setUploadProgress(null);

    applyExtractedData(data);

    if (fileProfile) {
      pushMessage(
        "ai",
        `PDF analysis complete. I've successfully extracted the ${fileProfile.company} complaint report (${fileProfile.caseCode}). The issue is ${fileProfile.defectLabel}. Form populated on the left.`
      );
    } else {
      pushMessage("ai", `Document analysis complete. Form populated on the left.`);
    }
  };

  const handleCommit = (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    const complaintId = `CMP-${Math.floor(1000 + Math.random() * 9000)}`;
    dispatch(
      addComplaint({
        id: Date.now(),
        complaint_id: complaintId,
        customer_name: formData.customerName || "N/A",
        product_name: formData.productName || "N/A",
        batch_number: formData.batchNumber || "N/A",
        priority: formData.severity || "Minor",
        severity: formData.severity || "Minor",
        risk_level: formData.severity || "Minor",
        status: "Pending",
        confidence_score: "AI-Assisted",
        complaint_category: formData.complaintCategory || "General",
        description: formData.complaintDescription || "",
        root_cause: formData.initialRiskAssessment || "",
        created_at: new Date().toISOString().split("T")[0],
      })
    );

    toast.success(`Complaint ${complaintId} committed to the QMS ledger.`);
    setSubmitting(false);
    setFormData(initialFormState);
    setReadyToCommit(false);
    setMessages([
      {
        id: nextId(),
        sender: "ai",
        text: "Ready to process new complaints. You can paste the raw email from the customer, or upload a PDF of the complaint report. I will extract the data and run the initial risk assessment.",
      },
    ]);
    navigate("/history");
  };

  const val = (key) => formData[key] || "";
  const cls = (key) => (formData[key] ? "filled" : "");

  return (
    <MainLayout>
      <div className="intake-page">
        {/* LEFT: Log Customer Complaint Form */}
        <div className="intake-form-panel">
          <div className="intake-form-header">
            <div>
              <h1>Log Customer Complaint</h1>
              <p>API &amp; FDF Quality Assurance Module</p>
            </div>
            <span className={`status-badge ${readyToCommit ? "ready" : "pending"}`}>
              <span className="dot" />
              {readyToCommit ? "Ready to Commit" : "Pending Triage"}
            </span>
          </div>

          <form onSubmit={handleCommit}>
            <h3 className="intake-section-title">1. Origin &amp; Customer Details</h3>
            <div className="intake-grid">
              <div className="intake-field">
                <label>Complaint Source</label>
                <input
                  className={cls("complaintSource")}
                  placeholder="Awaiting AI extraction..."
                  value={val("complaintSource")}
                  onChange={(e) => handleFieldChange("complaintSource", e.target.value)}
                />
              </div>
              <div className="intake-field">
                <label>Customer Name</label>
                <input
                  className={cls("customerName")}
                  placeholder="Awaiting AI extraction..."
                  value={val("customerName")}
                  onChange={(e) => handleFieldChange("customerName", e.target.value)}
                />
              </div>
            </div>

            <h3 className="intake-section-title">2. Product &amp; Batch Identification</h3>
            <div className="intake-grid">
              <div className="intake-field">
                <label>Product Name (API/FDF)</label>
                <input
                  className={cls("productName")}
                  placeholder="Awaiting AI extraction..."
                  value={val("productName")}
                  onChange={(e) => handleFieldChange("productName", e.target.value)}
                />
              </div>
              <div className="intake-field">
                <label>Product Strength</label>
                <input
                  className={cls("productStrength")}
                  placeholder="Awaiting AI extraction..."
                  value={val("productStrength")}
                  onChange={(e) => handleFieldChange("productStrength", e.target.value)}
                />
              </div>
              <div className="intake-field">
                <label>Batch / Lot Number</label>
                <input
                  className={cls("batchNumber")}
                  placeholder="Awaiting AI extraction..."
                  value={val("batchNumber")}
                  onChange={(e) => handleFieldChange("batchNumber", e.target.value)}
                />
              </div>
              <div className="intake-field">
                <label>Affected Quantity</label>
                <input
                  className={cls("affectedQuantity")}
                  placeholder="Awaiting AI extraction..."
                  value={val("affectedQuantity")}
                  onChange={(e) => handleFieldChange("affectedQuantity", e.target.value)}
                />
              </div>
              <div className="intake-field">
                <label>Manufacturing Date</label>
                <input
                  className={cls("manufacturingDate")}
                  placeholder="Awaiting AI extraction..."
                  value={val("manufacturingDate")}
                  onChange={(e) => handleFieldChange("manufacturingDate", e.target.value)}
                />
              </div>
              <div className="intake-field">
                <label>Expiry Date</label>
                <input
                  className={cls("expiryDate")}
                  placeholder="Awaiting AI extraction..."
                  value={val("expiryDate")}
                  onChange={(e) => handleFieldChange("expiryDate", e.target.value)}
                />
              </div>
            </div>

            <h3 className="intake-section-title">3. Facility &amp; Material Impact</h3>
            <div className="intake-grid">
              <div className="intake-field">
                <label>Originating Site Block</label>
                <select
                  className={cls("originatingSiteBlock")}
                  value={val("originatingSiteBlock")}
                  onChange={(e) => handleFieldChange("originatingSiteBlock", e.target.value)}
                >
                  <option value="">Awaiting AI classification...</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Packaging">Packaging</option>
                  <option value="Warehouse">Warehouse</option>
                  <option value="Distribution">Distribution</option>
                </select>
              </div>
              <div className="intake-field">
                <label>Impacted Non-Product Materials (NPM)</label>
                <input
                  className={cls("impactedNPM")}
                  placeholder="e.g., Primary packaging..."
                  value={val("impactedNPM")}
                  onChange={(e) => handleFieldChange("impactedNPM", e.target.value)}
                />
              </div>
            </div>

            <h3 className="intake-section-title">4. Defect Analysis</h3>
            <div className="intake-grid">
              <div className="intake-field full">
                <label>Complaint Category</label>
                <input
                  className={cls("complaintCategory")}
                  placeholder="Awaiting AI classification..."
                  value={val("complaintCategory")}
                  onChange={(e) => handleFieldChange("complaintCategory", e.target.value)}
                />
              </div>
              <div className="intake-field full">
                <label>Structured Defect Summary</label>
                <textarea
                  rows={3}
                  className={cls("complaintDescription")}
                  placeholder="AI will synthesize the complaint into a formal QMS description..."
                  value={val("complaintDescription")}
                  onChange={(e) => handleFieldChange("complaintDescription", e.target.value)}
                />
              </div>

              <div className="intake-field full">
                <div className="ai-risk-card">
                  <h4>
                    <Sparkles size={13} /> AI Copilot Risk Assessment
                  </h4>
                  <div className="intake-grid">
                    <div className="intake-field">
                      <label>Severity (Suggested)</label>
                      <input
                        className={cls("severity")}
                        placeholder="Awaiting AI assessment..."
                        value={val("severity")}
                        onChange={(e) => handleFieldChange("severity", e.target.value)}
                      />
                    </div>
                    <div className="intake-field">
                      <label>Suggested Next Action</label>
                      <input
                        className={cls("suggestedAction")}
                        placeholder="Awaiting AI assessment..."
                        value={val("suggestedAction")}
                        onChange={(e) => handleFieldChange("suggestedAction", e.target.value)}
                      />
                    </div>
                    <div className="intake-field full">
                      <label>Initial Risk Assessment</label>
                      <input
                        className={cls("initialRiskAssessment")}
                        placeholder="Awaiting AI assessment..."
                        value={val("initialRiskAssessment")}
                        onChange={(e) =>
                          handleFieldChange("initialRiskAssessment", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" className="commit-btn" disabled={!readyToCommit || submitting}>
              {submitting ? "Committing..." : "Commit to QMS Ledger"}
            </button>
          </form>
        </div>

        {/* RIGHT: AIVOA Copilot */}
        <div className="copilot-panel">
          <div className="copilot-header">
            <div className="copilot-header-title">
              <Sparkles size={16} color="#4f46e5" />
              <div>
                <h2>AIVOA Copilot</h2>
                <p>Drop complaint files or paste text below.</p>
              </div>
            </div>
            <span className={`copilot-status-dot ${readyToCommit ? "active" : ""}`} />
          </div>

          <div className="copilot-messages" ref={scrollRef}>
            {messages.map((m) => {
              if (m.sender === "file") {
                return (
                  <div key={m.id} className="chat-bubble file-chip">
                    <FileText size={14} />
                    <span>{m.text}</span>
                  </div>
                );
              }
              return (
                <div key={m.id} className={`chat-bubble ${m.sender === "user" ? "user" : "ai"}`}>
                  {m.text}
                </div>
              );
            })}

            {isThinking && (
              <div className="chat-typing">
                <span />
                <span />
                <span />
              </div>
            )}

            {uploadProgress !== null && (
              <div className="chat-progress-wrap">
                Extracting tabular data via OCR...
                <div className="chat-progress-bar">
                  <div className="chat-progress-fill" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}
          </div>

          <form className="copilot-input-row" onSubmit={handleSend}>
            <button
              type="button"
              className="copilot-attach-btn"
              onClick={handleFileButtonClick}
              title="Attach a complaint document (PDF)"
            >
              <Paperclip size={16} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.docx"
              style={{ display: "none" }}
              onChange={handleFileSelected}
            />
            <input
              type="text"
              className="copilot-text-input"
              placeholder="Type a message or paste a complaint..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button type="submit" className="copilot-send-btn" disabled={!inputText.trim()}>
              <Send size={15} />
            </button>
          </form>
          <div className="copilot-footer-note">POWERED BY LANGGRAPH</div>
        </div>
      </div>
    </MainLayout>
  );
}
