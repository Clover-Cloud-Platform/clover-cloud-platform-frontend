// Importing necessary modules and components
import * as React from "react";
import {useEffect} from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  Fade,
  FormControl,
  FormHelperText,
  Grid,
  InputAdornment,
  InputLabel,
  Link,
  OutlinedInput,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {ThemeProvider} from "@mui/material/styles";
import {theme} from "../App";
import {emailRegex} from "./SignUp";
import {Link as RouterLink} from "react-router-dom";
import GoogleIcon from "@mui/icons-material/Google";
import GitHubIcon from "@mui/icons-material/GitHub";
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
} from "firebase/auth";
import {initializeApp} from "firebase/app";
import IconButton from "@mui/material/IconButton";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Visibility from "@mui/icons-material/Visibility";
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();
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

// Copyright component
function Copyright(props) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}>
      {"Copyright © Clover Cloud Team "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}

// Function that creates SignIn component
export default function SignIn() {
  // Define states for email error, password error, email helper and password helper
  const [emailError, setEmailError] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState(false);
  const [emailHelper, setEmailHelper] = React.useState("");
  const [passwordHelper, setPasswordHelper] = React.useState("");
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword(show => !show);

  const handleMouseDownPassword = event => {
    event.preventDefault();
  };

  // Change theme color
  useEffect(() => {
    document
      .querySelector('meta[name="theme-color"]')
      .setAttribute("content", "#ede9fe");
  }, []);

  // Handle submit sign in form
  const handleSubmit = event => {
    event.preventDefault();

    // Get entered data
    const data = new FormData(event.currentTarget);
    const email = data.get("email").trim();
    const password = data.get("password");

    // Check email
    if (!emailRegex.test(email)) {
      setEmailError(true);
      setEmailHelper("Invalid email");
    } else {
      const auth = getAuth();
      signInWithEmailAndPassword(auth, email, password)
        .then(userCredential => {
          window.location.href = "/instances";
        })
        .catch(error => {
          // Handle Errors.
          const errorMessage = error.message;
          setErrorText(errorMessage);
          setError(true);
        });
    }
  };

  const signInWithGoogle = () => {
    const auth = getAuth();
    signInWithPopup(auth, googleProvider)
      .then(result => {
        window.location.href = "/instances";
      })
      .catch(error => {
        // Handle Errors.
        const errorMessage = error.message;
        setErrorText(errorMessage);
        setError(true);
      });
  };

  const signInWithGitHub = () => {
    const auth = getAuth();
    signInWithPopup(auth, githubProvider)
      .then(result => {
        window.location.href = "/instances";
      })
      .catch(error => {
        // Handle Errors.
        const errorMessage = error.message;
        setErrorText(errorMessage);
        setError(true);
      });
  };

  // Render component
  return (
    <ThemeProvider theme={theme}>
      <Fade in={true}>
        <Box>
          <Container component="main" maxWidth="xs">
            <Box
              sx={{
                marginTop: 8,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}>
              <Avatar sx={{m: 1, bgcolor: "primary.400"}}>
                <LockOutlinedIcon />
              </Avatar>
              <Typography component="h1" variant="h5">
                Sign in
              </Typography>
              <Box component="form" onSubmit={handleSubmit} sx={{mt: 1}}>
                <TextField
                  error={emailError}
                  helperText={emailHelper}
                  onChange={() => {
                    setEmailError(false);
                    setEmailHelper("");
                  }}
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                />
                <FormControl
                  variant="outlined"
                  sx={{width: "100%"}}
                  error={passwordError}>
                  <InputLabel htmlFor="password">Password *</InputLabel>
                  <OutlinedInput
                    type={showPassword ? "text" : "password"}
                    onChange={() => {
                      setPasswordError(false);
                      setPasswordHelper("");
                    }}
                    required
                    fullWidth
                    name="password"
                    id="password"
                    autoComplete="new-password"
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    }
                    label="Password"
                    aria-describedby="password-helper-text"
                  />
                  <FormHelperText id="password-helper-text">
                    {passwordHelper}
                  </FormHelperText>
                </FormControl>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{mt: 3, mb: 2}}>
                  Sign In
                </Button>
                <Divider
                  sx={{
                    fontWeight: 400,
                    fontFamily: "Roboto",
                    color: "text.primary",
                  }}>
                  OR
                </Divider>
                <Button
                  variant={"outlined"}
                  fullWidth
                  sx={{mt: "16px"}}
                  startIcon={<GoogleIcon />}
                  onClick={signInWithGoogle}>
                  Sign In with Google
                </Button>
                <Button
                  variant={"outlined"}
                  fullWidth
                  sx={{mt: "8px"}}
                  startIcon={<GitHubIcon />}
                  onClick={signInWithGitHub}>
                  Sign In with GitHub
                </Button>
                <Grid container mt={"16px"}>
                  <Grid item xs>
                    <Link component={RouterLink} to={"/reset"} variant="body2">
                      Forgot password?
                    </Link>
                  </Grid>
                  <Grid item>
                    <Link component={RouterLink} to={"/signup"} variant="body2">
                      {"Don't have an account? Sign Up"}
                    </Link>
                  </Grid>
                </Grid>
              </Box>
            </Box>
            <Copyright sx={{mt: 8, mb: 4}} />
          </Container>
        </Box>
      </Fade>
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
