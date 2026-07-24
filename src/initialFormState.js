export const initialFormState = {
  // 1. Origin & Customer Details
  complaintSource: '',
  customerName: '',

  // 2. Product & Batch Identification
  productName: '',
  productStrength: '',
  batchNumber: '',
  affectedQuantity: '',
  manufacturingDate: '',
  expiryDate: '',

  // 3. Facility & Material Impact
  originatingSiteBlock: '',
  impactedNPM: '',

  // 4. Defect Analysis & AI Risk Assessment
  complaintCategory: '',
  complaintDescription: '',
  severity: '', // 'Minor' | 'Major' | 'Critical'
  suggestedAction: '',
  initialRiskAssessment: ''
};
