import React, {useEffect} from "react";
import {ThemeProvider} from "@mui/material/styles";
import {theme} from "../App";
import {
  Alert,
  Box,
  Container,
  Grid,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import {initializeApp} from "firebase/app";
import {
  getAuth,
  applyActionCode,
  verifyPasswordResetCode,
  confirmPasswordReset,
} from "firebase/auth";
import {useSearchParams} from "react-router-dom";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import Button from "@mui/material/Button";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

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

const ContainerBox = props => {
  return (
    <Box
      width={"100%"}
      height={"100vh"}
      display={"flex"}
      alignItems={"center"}
      justifyContent={"center"}
      flexDirection={"column"}
      gap={"20px"}>
      {props.children}
    </Box>
  );
};

const Text = props => {
  return (
    <Typography
      sx={{
        color: "text.primary",
        fontFamily: "Google Sans,Noto Sans,sans-serif",
        letterSpacing: "-.5px",
        lineHeight: "1.2em",
        fontSize: "24px",
        "@media (min-width:900px)": {fontSize: "30px"},
        textAlign: "center",
        mb: "30px",
      }}>
      {props.children}
    </Typography>
  );
};
const GoToDashboardButton = () => {
  return (
    <Button
      variant={"outlined"}
      endIcon={<ArrowForwardRoundedIcon />}
      href={"/instances"}>
      Go to dashboard
    </Button>
  );
};

export default function Action() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [emailVerified, setEmailVerified] = React.useState(false);
  const [accountEmail, setAccountEmail] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [passwordApplied, setPasswordApplied] = React.useState(false);

  const auth = getAuth(app);
  // Get the action to complete.
  const mode = searchParams.get("mode");
  // Get the one-time code from the query parameter.
  const actionCode = searchParams.get("oobCode");

  useEffect(() => {
    // Get the continue URL from the query parameter if available.
    const continueUrl = searchParams.get("continueUrl");
    // Get the language code if available.
    const lang = searchParams.get("lang") || "en";

    // Handle the user management action.
    switch (mode) {
      case "resetPassword":
        // Display reset password handler and UI.
        handleResetPassword(auth, actionCode, continueUrl, lang);
        break;
      case "verifyEmail":
        // Display email verification handler and UI.
        handleVerifyEmail(auth, actionCode, continueUrl, lang);
        break;
      default:
        // Error: invalid mode.
        setErrorText("Error: This link is invalid.");
        setError(true);
    }

    function handleVerifyEmail(auth, actionCode, continueUrl, lang) {
      // Try to apply the email verification code.
      applyActionCode(auth, actionCode)
        .then(resp => {
          // Email address has been verified.
          // TODO: Display a confirmation message to the user.
          // You could also provide the user with a link back to the app.
          // TODO: If a continue URL is available, display a button which on
          // click redirects the user back to the app via continueUrl with
          // additional state determined from that URL's parameters.

          setEmailVerified(true);
        })
        .catch(error => {
          setErrorText("Error: This link is invalid or expired.");
          setError(true);
        });
    }

    function handleResetPassword(auth, actionCode, continueUrl, lang) {
      // Localize the UI to the selected language as determined by the lang
      // parameter.

      // Verify the password reset code is valid.
      verifyPasswordResetCode(auth, actionCode)
        .then(email => {
          setAccountEmail(email);
        })
        .catch(error => {
          setErrorText(
            "Error: This link is invalid or expired. Try to reset the password again.",
          );
          setError(true);
        });
    }
  }, []);

  const applyNewPassword = () => {
    // Save the new password.
    confirmPasswordReset(auth, actionCode, newPassword)
      .then(resp => {
        // todo uncomment on prod
        //auth.signInWithEmailAndPassword(accountEmail, newPassword);
        setPasswordApplied(true);
      })
      .catch(error => {
        setErrorText(
          "Error occurred during confirmation. The link might have expired or the password is too weak.",
        );
        setError(true);
      });
  };

  const VerifyEmail = () => {
    if (emailVerified) {
      return (
        <ContainerBox>
          <CheckCircleOutlineRoundedIcon color={"success"} fontSize={"large"} />
          <Text>You have successfully verified your account.</Text>
          <GoToDashboardButton />
        </ContainerBox>
      );
    } else {
      return <></>;
    }
  };

  const ResetPassword = () => {
    if (accountEmail !== "") {
      return (
        <>
          {passwordApplied ? (
            <ContainerBox>
              <CheckCircleOutlineRoundedIcon
                color={"success"}
                fontSize={"large"}
              />
              <Text>You have successfully resetted your password.</Text>
              <GoToDashboardButton />
            </ContainerBox>
          ) : (
            <ContainerBox>
              <Text>Set a new password for your account ({accountEmail}).</Text>
              <Container component="main" maxWidth="xs">
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      value={newPassword}
                      onChange={e => {
                        setNewPassword(e.target.value);
                      }}
                      autoFocus
                      fullWidth
                      required
                      label="Password"
                      type="password"
                      autoComplete="new-password"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant={"contained"}
                      fullWidth
                      onClick={applyNewPassword}>
                      Ok
                    </Button>
                  </Grid>
                </Grid>
              </Container>
            </ContainerBox>
          )}
        </>
      );
    } else {
      return <></>;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      {mode === "verifyEmail" ? <VerifyEmail /> : <ResetPassword />}
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
          {errorText}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}
