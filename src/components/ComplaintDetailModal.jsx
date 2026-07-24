import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Divider,
  Chip,
  Grid,
  Box,
} from "@mui/material";

export default function ComplaintDetailModal({
  open,
  onClose,
  complaint,
}) {
  if (!complaint) return null;

  const getSeverityColor = (severity) => {
    switch ((severity || "").toLowerCase()) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "default";
    }
  };

  const getStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "resolved":
      case "closed":
        return "success";
      case "pending":
        return "warning";
      default:
        return "primary";
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: "bold" }}>
        Complaint Details
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ mt: 2 }}>
        <Grid container spacing={2}>

          <Grid item xs={6}>
            <Typography variant="caption">Complaint ID</Typography>
            <Typography>{complaint.complaint_id}</Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography variant="caption">Customer</Typography>
            <Typography>{complaint.customer_name}</Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography variant="caption">Product</Typography>
            <Typography>{complaint.product_name}</Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography variant="caption">Batch Number</Typography>
            <Typography>{complaint.batch_number}</Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography variant="caption">Severity</Typography>
            <br />
            <Chip
              label={complaint.severity}
              color={getSeverityColor(complaint.severity)}
            />
          </Grid>

          <Grid item xs={6}>
            <Typography variant="caption">Status</Typography>
            <br />
            <Chip
              label={complaint.status}
              color={getStatusColor(complaint.status)}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="caption">
              Complaint Description
            </Typography>

            <Box
              sx={{
                mt: 1,
                p: 2,
                bgcolor: "#f8fafc",
                borderRadius: 2,
              }}
            >
              {complaint.complaint_description}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="caption">
              AI Summary
            </Typography>

            <Box
              sx={{
                mt: 1,
                p: 2,
                bgcolor: "#eff6ff",
                borderRadius: 2,
              }}
            >
              {complaint.ai_summary}
            </Box>
          </Grid>

          <Grid item xs={6}>
            <Typography variant="caption">
              Risk Level
            </Typography>

            <Typography fontWeight="bold">
              {complaint.risk_level}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Typography variant="caption">
              AI Confidence
            </Typography>

            <Typography fontWeight="bold">
              {complaint.confidence_score}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="caption">
              Root Cause
            </Typography>

            <Box
              sx={{
                mt: 1,
                p: 2,
                bgcolor: "#fefce8",
                borderRadius: 2,
              }}
            >
              {complaint.root_cause}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="caption">
              CAPA Recommendation
            </Typography>

            <Box
              sx={{
                mt: 1,
                p: 2,
                bgcolor: "#f0fdf4",
                borderRadius: 2,
              }}
            >
              {complaint.capa_recommendation}
            </Box>
          </Grid>

        </Grid>
      </DialogContent>

      <Divider />

      <DialogActions>
        <Button
          variant="contained"
          onClick={onClose}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}