import React, {useEffect} from "react";
import {ThemeProvider} from "@mui/material/styles";
import {theme} from "../App";
import {ContainerBox, Text} from "./Action";
import {Alert, Container, Fade, Grid, Snackbar, TextField} from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import {emailRegex} from "./SignUp";
import {getAuth, sendPasswordResetEmail} from "firebase/auth";
import {initializeApp} from "firebase/app";
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: "clover-cloud-platform",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};
const app = initializeApp(firebaseConfig);

// Reset password page
export default function ResetPassword() {
  const [getEmail, setGetEmail] = React.useState(true);
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [emailError, setEmailError] = React.useState(false);
  const [emailHelper, setEmailHelper] = React.useState("");

  useEffect(() => {
    // Set title
    document.title = "Reset Password - Clover Cloud Platform";

    // Change theme color
    document
      .querySelector('meta[name="theme-color"]')
      .setAttribute("content", "#ede9fe");
  }, []);

  const resetPassword = () => {
    if (!emailRegex.test(email.trim())) {
      setEmailError(true);
      setEmailHelper("Invalid email");
    } else {
      const auth = getAuth();
      sendPasswordResetEmail(auth, email.trim())
        .then(() => {
          // Password reset email sent!
          setGetEmail(false);
        })
        .catch(error => {
          // Handle Errors.
          const errorMessage = error.message;
          setErrorText(errorMessage);
          setError(true);
        });
    }
  };

  return (
    <ThemeProvider theme={theme}>
      {getEmail ? (
        <Fade in={true}>
          <Box>
            <ContainerBox>
              <Text>
                Please enter your account’s email address to reset your
                password.
              </Text>
              <Container component="main" maxWidth="xs">
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      error={emailError}
                      helperText={emailHelper}
                      value={email}
                      onChange={e => {
                        setEmailError(false);
                        setEmailHelper("");
                        setEmail(e.target.value);
                      }}
                      required
                      fullWidth
                      label={"Email Address"}
                      id="email"
                      name="email"
                      autoComplete="email"
                      autoFocus
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant={"contained"}
                      fullWidth
                      onClick={resetPassword}>
                      Ok
                    </Button>
                  </Grid>
                </Grid>
              </Container>
            </ContainerBox>
          </Box>
        </Fade>
      ) : (
        <ContainerBox>
          <MailOutlineRoundedIcon color={"primary"} fontSize={"large"} />
          <Text>
            Please check your email. We have sent you a link to reset your
            password.
          </Text>
        </ContainerBox>
      )}
      <Snackbar
        anchorOrigin={{vertical: "bottom", horizontal: "center"}}
        open={error}
        onClose={() => {
          setError(false);
        }}>
        <Alert
          onClose={() => {
            setError(false);
          }}
          severity="error"
          sx={{width: "100%"}}>
          {errorText !== ""
            ? `Error: ${errorText
                .split("/")[1]
                .split("-")
                .join(" ")
                .slice(0, -2)}. Please try again.`
            : ""}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}
