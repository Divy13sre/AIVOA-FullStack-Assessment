import { createSlice } from "@reduxjs/toolkit";

const complaintSlice = createSlice({
  name: "complaints",
  initialState: {
    list: [],
  },
  reducers: {
    addComplaint: (state, action) => {
      state.list.push(action.payload);
    },

    setComplaints: (state, action) => {
      state.list = action.payload;
    },

    updateComplaint: (state, action) => {
      const index = state.list.findIndex(
        (item) => item.id === action.payload.id
      );

      if (index !== -1) {
        state.list[index] = action.payload;
      }
    },
  },
});

export const {
  addComplaint,
  setComplaints,
  updateComplaint,
} = complaintSlice.actions;

export default complaintSlice.reducer;