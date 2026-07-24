// src/components/ComplaintIntake.jsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateComplaintData } from '../redux/complaintSlice'; // Adjust path as needed

export default function ComplaintIntake() {
  const dispatch = useDispatch();
  
  // This hook "listens" to the store. Whenever the AI updates the data, 
  // this form will automatically re-render with the new values.
  const formData = useSelector((state) => state.complaints.data);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Dispatching an action manually if the user edits the form
    dispatch(updateComplaintData({ [name]: value }));
  };

  return (
    <div className="form-container">
      <input 
        name="productName" 
        value={formData.productName} 
        onChange={handleChange} 
        placeholder="Product Name" 
      />
      <input 
        name="batchNumber" 
        value={formData.batchNumber} 
        onChange={handleChange} 
        placeholder="Batch Number" 
      />
      {/* Add remaining fields... */}
    </div>
  );
}