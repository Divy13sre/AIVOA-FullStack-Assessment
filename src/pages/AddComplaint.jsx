import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';

export default function AddComplaint() {
  const [formData, setFormData] = useState({
    customer_name: '',
    product_name: '',
    complaint_category: '',
    severity: 'Low',
    complaint_description: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // POST request to your backend
      await axios.post("http://127.0.0.1:8000/api/complaints", formData);
      alert("Complaint added successfully!");
      navigate("/"); // Redirect back to Dashboard
    } catch (error) {
      console.error("Error saving complaint:", error);
      alert("Failed to save complaint.");
    }
  };

  return (
    <MainLayout>
      <div style={{ maxWidth: '600px', margin: '20px auto' }}>
        <h1>Add New Complaint</h1>
        <form onSubmit={handleSubmit}>
          <input name="customer_name" placeholder="Customer Name" onChange={handleChange} required />
          <input name="product_name" placeholder="Product Name" onChange={handleChange} required />
          <select name="complaint_category" onChange={handleChange} required>
            <option value="">Select Category</option>
            <option value="Quality Issue">Quality Issue</option>
            <option value="Packaging">Packaging</option>
          </select>
          <textarea name="complaint_description" placeholder="Description" onChange={handleChange} />
          <button type="submit">Submit Complaint</button>
        </form>
      </div>
    </MainLayout>
  );
}