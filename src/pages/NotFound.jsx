import { Link } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
} from "@mui/material";

import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";

export default function NotFound() {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Paper
          elevation={8}
          sx={{
            p: 5,
            width: "100%",
            textAlign: "center",
            borderRadius: 4,
          }}
        >
          <ErrorOutlineRoundedIcon
            sx={{
              fontSize: 90,
              color: "#2563eb",
              mb: 2,
            }}
          />

          <Typography
            variant="h2"
            fontWeight="bold"
            color="primary"
          >
            404
          </Typography>

          <Typography
            variant="h5"
            fontWeight={600}
            mt={2}
          >
            Oops! Page Not Found
          </Typography>

          <Typography
            color="text.secondary"
            mt={1}
            mb={4}
          >
            The page you're looking for doesn't exist or has been moved.
          </Typography>

          <Button
            component={Link}
            to="/"
            variant="contained"
            size="large"
            startIcon={<HomeRoundedIcon />}
            sx={{
              px: 4,
              py: 1.2,
              borderRadius: 3,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Back to Dashboard
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}