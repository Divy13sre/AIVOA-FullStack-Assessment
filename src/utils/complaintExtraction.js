// Lightweight heuristic "AI" extraction layer for the complaint intake copilot.
//
// There is no live LLM backend wired up yet (see src/api/complaintApi.js for the
// real endpoint this is meant to eventually call: POST /api/extract-complaint).
// Until that backend exists, these helpers parse free-text / uploaded files
// with regex + keyword heuristics so the intake screen behaves the same way
// the product demo does. Swap `simulateTextExtraction` / `simulateFileExtraction`
// out for real API calls once the backend is available -- callers already try
// the real API first and fall back to these.

const DEFECT_PROFILES = [
  {
    match: /discolor/i,
    complaintCategory: "Product Defect - Discoloration",
    severity: "Major",
    suggestedAction: "Route to QA Investigation & Issue Replacements",
    initialRiskAssessment:
      "Potential moisture ingress or primary packaging seal failure leading to product discoloration.",
    impactedNPM: "Primary Packaging (Bottle)",
    defectLabel: "discolored capsules",
  },
  {
    match: /(contaminat|foreign matter|foreign particle)/i,
    complaintCategory: "Foreign Matter Contamination",
    severity: "Critical",
    suggestedAction: "Quarantine batch & escalate to QA/RA immediately",
    initialRiskAssessment:
      "Potential contamination introduced during manufacturing, milling, or drum sealing. Recommend containment and batch hold.",
    impactedNPM: "Primary Packaging (Drum)",
    defectLabel: "foreign matter contamination",
  },
  {
    match: /(leak|seal fail|seal integrity)/i,
    complaintCategory: "Packaging Seal Failure",
    severity: "Major",
    suggestedAction: "Inspect capping/sealing station & hold remaining stock",
    initialRiskAssessment:
      "Torque or seal integrity deviation suspected at the capping/sealing stage.",
    impactedNPM: "Primary Packaging (Cap/Seal)",
    defectLabel: "packaging seal failure",
  },
  {
    match: /(break|crack|chip)/i,
    complaintCategory: "Physical Damage - Breakage",
    severity: "Minor",
    suggestedAction: "Review in-transit handling & secondary packaging",
    initialRiskAssessment:
      "Physical damage consistent with handling or compression stress during transit.",
    impactedNPM: "Secondary Packaging (Carton)",
    defectLabel: "physical breakage",
  },
  {
    match: /(label|dosage|mislabel)/i,
    complaintCategory: "Labeling / Dosage Discrepancy",
    severity: "Minor",
    suggestedAction: "Verify labeling line changeover records",
    initialRiskAssessment:
      "Possible label changeover error; recommend reconciliation against batch packaging records.",
    impactedNPM: "Labeling Materials",
    defectLabel: "labeling discrepancy",
  },
];

const DEFAULT_PROFILE = {
  complaintCategory: "General Product Quality Complaint",
  severity: "Minor",
  suggestedAction: "Route to QA for initial triage",
  initialRiskAssessment:
    "Insufficient detail to auto-assess risk. Recommend QA follow-up with the customer for more information.",
  impactedNPM: "Primary Packaging",
  defectLabel: "a quality issue",
};

function pickDefectProfile(text) {
  return DEFECT_PROFILES.find((p) => p.match.test(text)) || DEFAULT_PROFILE;
}

function guessComplaintSource(customerName) {
  if (!customerName) return "Email";
  if (/pharmacy/i.test(customerName)) return "Pharmacy";
  if (/hospital|clinic/i.test(customerName)) return "Hospital";
  if (/distributor/i.test(customerName)) return "Distributor";
  return "Email";
}

/**
 * Parse a free-text complaint description (pasted email, transcript, etc.)
 * into a partial form-data object. Returns { data, defectLabel } where
 * `data` only contains the keys we were able to confidently extract.
 */
export function simulateTextExtraction(rawText) {
  const text = (rawText || "").trim();
  const data = {};

  const customerMatch = text.match(
    /^([A-Z][\w&.,'-]*(?:\s+[A-Z][\w&.,'-]*){0,4})\s+reported/
  );
  if (customerMatch) {
    data.customerName = customerMatch[1].trim();
    data.complaintSource = guessComplaintSource(data.customerName);
  }

  const productMatch = text.match(
    /in ([A-Za-z][A-Za-z0-9()/\-]*(?:\s+[A-Za-z0-9()/\-]+)*?)\s+(\d+(?:\.\d+)?\s?(?:mg|mcg|ml|g|kg|%\s?w\/w|IU))\b/i
  );
  if (productMatch) {
    data.productName = productMatch[1].trim();
    data.productStrength = productMatch[2].trim();
  }

  const batchMatch = text.match(
    /batch\s*(?:number|no\.?|#)?\s*[:\-]?\s*([A-Z]{0,4}[\-\s]?\d[\w\-]{2,})/i
  );
  if (batchMatch) data.batchNumber = batchMatch[1].trim();

  const mfgMatch = text.match(
    /manufactur(?:ing|ed)?\s*date\s*[:\-]?\s*([A-Za-z]+\s+\d{4}|\d{1,2}\s+[A-Za-z]+\s+\d{4}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i
  );
  if (mfgMatch) data.manufacturingDate = mfgMatch[1].trim();

  const expMatch = text.match(
    /exp(?:iry)?\s*date\s*[:\-]?\s*([A-Za-z]+\s+\d{4}|\d{1,2}\s+[A-Za-z]+\s+\d{4}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i
  );
  if (expMatch) data.expiryDate = expMatch[1].trim();

  const qtyMatch = text.match(
    /(\d+\s?(?:capsules?|tablets?|units?|kg|bottles?|vials?|drums?|strips?))/i
  );
  if (qtyMatch) data.affectedQuantity = qtyMatch[1].trim();

  const profile = pickDefectProfile(text);
  data.complaintCategory = profile.complaintCategory;
  data.severity = profile.severity;
  data.suggestedAction = profile.suggestedAction;
  data.initialRiskAssessment = profile.initialRiskAssessment;
  data.impactedNPM = data.impactedNPM || profile.impactedNPM;
  data.originatingSiteBlock = data.originatingSiteBlock || "Manufacturing";

  const who = data.customerName || "The customer";
  data.complaintDescription = `${who} reported ${profile.defectLabel}${
    data.productName ? ` in ${data.productName}` : ""
  }${data.batchNumber ? ` (Batch ${data.batchNumber})` : ""}. Logged for QA investigation.`;

  return { data, defectLabel: profile.defectLabel, customerName: data.customerName };
}

/**
 * Parse a short follow-up / correction message like
 * "ah sorry the batch number is BMX240602 and affected quantity is 48 capsules"
 * Returns { data, changedFields } -- only fields it's confident about.
 */
export function simulateCorrectionParse(message) {
  const text = message || "";
  const data = {};
  const changedFields = [];

  const rules = [
    { re: /batch\s*(?:number|no\.?|#)?\s*(?:is|to|=|:)\s*([A-Z0-9\-\s]+?)(?=\s+and\b|[.,]|$)/i, key: "batchNumber", label: "Batch / Lot Number" },
    { re: /affected quantity\s*(?:is|to|=|:)\s*([^.,]+?)(?=\s+and\b|[.,]|$)/i, key: "affectedQuantity", label: "Affected Quantity" },
    { re: /customer(?:\s*name)?\s*(?:is|to|=|:)\s*([^.,]+?)(?=\s+and\b|[.,]|$)/i, key: "customerName", label: "Customer Name" },
    { re: /product(?:\s*name)?\s*(?:is|to|=|:)\s*([^.,]+?)(?=\s+and\b|[.,]|$)/i, key: "productName", label: "Product Name" },
    { re: /severity\s*(?:is|to|=|:)\s*(minor|major|critical)/i, key: "severity", label: "Severity" },
    { re: /(?:manufactur(?:ing)?)\s*date\s*(?:is|to|=|:)\s*([^.,]+?)(?=\s+and\b|[.,]|$)/i, key: "manufacturingDate", label: "Manufacturing Date" },
    { re: /exp(?:iry)?\s*date\s*(?:is|to|=|:)\s*([^.,]+?)(?=\s+and\b|[.,]|$)/i, key: "expiryDate", label: "Expiry Date" },
  ];

  rules.forEach(({ re, key, label }) => {
    const m = text.match(re);
    if (m && m[1]) {
      const value = m[1].trim().replace(/\s+/g, " ");
      data[key] =
        key === "severity"
          ? value[0].toUpperCase() + value.slice(1).toLowerCase()
          : value;
      changedFields.push({ label, value: data[key] });
    }
  });

  return { data, changedFields };
}

const CANNED_FILE_PROFILES = [
  {
    company: "Zenith Life Sciences",
    caseCode: "CC-2026-00154",
    defectLabel: "foreign matter contamination in the Metformin API drum",
    data: {
      complaintSource: "Email",
      customerName: "ABC Formulations Ltd.",
      productName: "Metformin Hydrochloride API",
      productStrength: "IP/BP",
      batchNumber: "MFH260712A",
      affectedQuantity: "25 kg (1 HDPE Drum)",
      manufacturingDate: "25 June 2026",
      expiryDate: "Not Provided",
      originatingSiteBlock: "Manufacturing",
      impactedNPM: "Primary Packaging (Drum)",
      complaintCategory: "Foreign Matter Contamination",
      complaintDescription:
        "ABC Formulations Ltd. reported foreign matter contamination in the Metformin Hydrochloride API drum (Batch MFH260712A). Logged for QA investigation.",
      severity: "Critical",
      suggestedAction: "Quarantine batch & escalate to QA/RA immediately",
      initialRiskAssessment:
        "Potential contamination introduced during manufacturing or drum sealing process. Recommend containment and batch hold.",
    },
  },
  {
    company: "Metro Hospital",
    caseCode: "CC-2026-00171",
    defectLabel: "dissolution failure",
    data: {
      complaintSource: "Hospital",
      customerName: "Metro Hospital",
      productName: "Paracetamol",
      productStrength: "650 mg",
      batchNumber: "PMX-8821",
      affectedQuantity: "1 blister strip (10 tablets)",
      manufacturingDate: "Not Provided",
      expiryDate: "Not Provided",
      originatingSiteBlock: "Manufacturing",
      impactedNPM: "Primary Packaging (Blister)",
      complaintCategory: "General Product Quality Complaint",
      complaintDescription:
        "Metro Hospital reported a dissolution failure for Paracetamol 650 mg (Batch PMX-8821). Logged for QA investigation.",
      severity: "Major",
      suggestedAction: "Route to QA for dissolution re-test & trend review",
      initialRiskAssessment:
        "Possible formulation or compression deviation affecting dissolution profile.",
    },
  },
  {
    company: "Sunrise Distributors",
    caseCode: "CC-2026-00188",
    defectLabel: "packaging seal failure",
    data: {
      complaintSource: "Distributor",
      customerName: "Sunrise Distributors",
      productName: "Cough Syrup",
      productStrength: "100 ml",
      batchNumber: "CS-4019",
      affectedQuantity: "6 bottles",
      manufacturingDate: "Not Provided",
      expiryDate: "Not Provided",
      originatingSiteBlock: "Packaging",
      impactedNPM: "Primary Packaging (Cap/Seal)",
      complaintCategory: "Packaging Seal Failure",
      complaintDescription:
        "Sunrise Distributors reported packaging seal failure on Cough Syrup 100 ml (Batch CS-4019). Logged for QA investigation.",
      severity: "Major",
      suggestedAction: "Inspect capping station & hold remaining stock",
      initialRiskAssessment:
        "Torque value or seal integrity deviation suspected at the capping stage.",
    },
  },
];

let fileUploadCounter = 0;

/**
 * Simulate OCR/document extraction for an uploaded file. Deterministic-ish:
 * cycles through a small pool of realistic canned profiles.
 */
export function simulateFileExtraction() {
  const profile = CANNED_FILE_PROFILES[fileUploadCounter % CANNED_FILE_PROFILES.length];
  fileUploadCounter += 1;
  return profile;
}
