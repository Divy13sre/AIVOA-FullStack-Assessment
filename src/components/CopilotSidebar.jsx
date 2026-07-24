import React, { useState } from 'react';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import SendIcon from '@mui/icons-material/Send';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

export function CopilotSidebar({ onExtractData, setIsProcessing }) {
  const [promptText, setPromptText] = useState('');
  const [fileName, setFileName] = useState('');
  const [chatLog, setChatLog] = useState([
    { sender: 'ai', text: '👋 Hello! Drop a complaint document (PDF/Email) here or type details below to auto-fill the complaint form.' }
  ]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      // Simulate AI extraction from document
      const simulatedExtractedData = {
        complaintSource: 'Email Transcript',
        customerName: 'Metro Hospital',
        productName: 'Paracetamol 650mg',
        batchNumber: 'PMX-8821',
        severity: 'Major',
        suggestedAction: 'Quarantine remaining stock at site.',
        initialAssessment: `Extracted from ${file.name}: Dissolution failure reported by client.`
      };
      
      onExtractData(simulatedExtractedData);
      setChatLog((prev) => [
        ...prev,
      { sender: 'user', text: `Uploaded document: ${file.name}` },
      { sender: 'ai', text: `Successfully parsed ${file.name}. Form fields have been auto-filled with extracted data!` }
      ]);
    }
  };

  const handleSendPrompt = (e) => {
    e.preventDefault();
    if (!promptText.trim()) return;

    const userMsg = promptText;
    setPromptText('');
    setChatLog((prev) => [...prev, { sender: 'user', text: userMsg }]);

    // Simulate smart prompt parsing
    setTimeout(() => {
      let aiReply = "I've analyzed your instruction and updated the form.";
      if (userMsg.toLowerCase().includes('batch')) {
        onExtractData({ batchNumber: 'BATCH-999' });
        aiReply = "Updated batch number to BATCH-999.";
      } else if (userMsg.toLowerCase().includes('critical') || userMsg.toLowerCase().includes('severity')) {
        onExtractData({ severity: 'Critical' });
        aiReply = "Set complaint severity level to Critical.";
      }

      setChatLog((prev) => [...prev, { sender: 'ai', text: aiReply }]);
    }, 600);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '20px', boxSizing: 'border-box' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #334155', paddingBottom: '12px' }}>
        <AutoAwesomeIcon sx={{ color: '#60a5fa', fontSize: '20px' }} />
        <div>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#ffffff' }}>AIVOA Copilot</h3>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>QA Intake AI Assistant</span>
        </div>
      </div>

      {/* Upload Box Area */}
      <div style={{ background: '#1e293b', border: '1px dashed #475569', borderRadius: '10px', padding: '12px', marginBottom: '16px', textAlign: 'center' }}>
        <DescriptionOutlinedIcon sx={{ color: '#94a3b8', fontSize: '24px', marginBottom: '4px' }} />
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#e2e8f0', cursor: 'pointer', marginBottom: '6px' }}>
          <span style={{ color: '#60a5fa', textDecoration: 'underline' }}>Choose file</span> or drag & drop here
          <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} accept=".pdf,.txt,.docx" />
        </label>
        <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>Supports PDF, TXT, or DOCX up to 10MB</span>
        {fileName && <div style={{ fontSize: '11px', color: '#34d399', marginTop: '6px', fontWeight: 500 }}>📎 {fileName}</div>}
      </div>

      {/* Chat Messages Log Area */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px', paddingRight: '4px' }}>
        {chatLog.map((msg, index) => (
          <div
            key={index}
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              lineHeight: '1.4',
              maxWidth: '90%',
              wordBreak: 'break-word',
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              background: msg.sender === 'user' ? '#2563eb' : '#1e293b',
              color: '#ffffff',
              border: msg.sender === 'ai' ? '1px solid #334155' : 'none',
            }}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* Prompt Input Form */}
      <form onSubmit={handleSendPrompt} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          type="text"
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          placeholder="Ask AI or dictate edits (e.g. update batch)..."
          style={{
            flex: 1,
            background: '#1e293b',
            border: '1px solid #475569',
            borderRadius: '8px',
            padding: '10px 12px',
            color: '#ffffff',
            fontSize: '12px',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          style={{
            background: '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <SendIcon sx={{ fontSize: '16px' }} />
        </button>
      </form>

    </div>
  );
}