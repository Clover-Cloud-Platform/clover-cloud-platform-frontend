import * as React from "react";
import {useEffect} from "react";
import {
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  Fade,
  Grid,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import GoogleIcon from "@mui/icons-material/Google";
import GitHubIcon from "@mui/icons-material/GitHub";
import {ThemeProvider} from "@mui/material/styles";
import {theme} from "../App";
import {socket} from "./Instances";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  sendEmailVerification,
} from "firebase/auth";

import {initializeApp} from "firebase/app";
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

export const emailRegex =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;

let timerCount = 60;

// Function that renders SignUp component
export default function SignUp() {
  const [usernameError, setUsernameError] = React.useState(false);
  const [emailError, setEmailError] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState(false);
  const [usernameHelper, setUsernameHelper] = React.useState("");
  const [emailHelper, setEmailHelper] = React.useState("");
  const [passwordHelper, setPasswordHelper] = React.useState("");
  const [verify, setVerify] = React.useState(false);
  const [codeError, setCodeError] = React.useState(false);
  const [codeHelper, setCodeHelper] = React.useState("");
  const [authCode, setAuthCode] = React.useState();
  const [timer, setTimer] = React.useState(60);
  const [resend, disableResend] = React.useState(true);
  const [userData, setUserData] = React.useState({
    email: undefined,
    username: undefined,
    password: undefined,
  });
  const [signupButtonState, disableSignupButton] = React.useState(false);

  // Change theme color
  useEffect(() => {
    document
      .querySelector('meta[name="theme-color"]')
      .setAttribute("content", "#ede9fe");
  }, []);

  // Handle submit of the form
  const handleSubmit = event => {
    event.preventDefault();
    disableSignupButton(true);
    const data = new FormData(event.currentTarget);
    const email = data.get("email").trim();
    const password = data.get("password");

    // Check email and password
    if (!emailRegex.test(email)) {
      disableSignupButton(false);
      setEmailError(true);
      setEmailHelper("Invalid email");
    } else if (password.length < 6) {
      disableSignupButton(false);
      setPasswordError(true);
      setPasswordHelper("Password must contain minimum 6 characters");
    } else {
      const auth = getAuth();
      createUserWithEmailAndPassword(auth, email, password)
        .then(userCredential => {
          // Signed in
          const user = userCredential.user;
          console.log(user);
          sendEmailVerification(user);
        })
        .catch(error => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log(errorMessage);
        });
    }
  };

  const signUpWithGoogle = () => {
    const auth = getAuth();
    signInWithPopup(auth, googleProvider)
      .then(result => {
        // The signed-in user info.
        const user = result.user;
      })
      .catch(error => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
      });
  };

  const signUpWithGitHub = () => {
    const auth = getAuth();
    signInWithPopup(auth, githubProvider)
      .then(result => {
        // The signed-in user info.
        const user = result.user;
      })
      .catch(error => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
      });
  };

  // Handle verification code submitting
  const handleAuthCodeSubmit = event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const enteredCode = data.get("authCode").trim();
    if (enteredCode == authCode) {
      socket.emit("AuthByEmail", {
        email: userData.email,
        username: userData.username,
        password: userData.password,
        resend_code: false,
      });
      socket.on("AuthByEmailRes", uid => {
        localStorage.setItem("uid", uid);
        window.location.href = "/instances";
      });
    } else {
      setCodeError(true);
      setCodeHelper("Invalid auth code");
    }
  };

  // Function for re-sending verification code
  const resendCode = e => {
    e.preventDefault();
    socket.emit("AuthByEmail", {
      email: userData.email,
      username: userData.username,
      password: userData.password,
      resend_code: true,
    });
    disableResend(true);
    const timerInterval = setInterval(() => {
      if (timerCount > 0) {
        setTimer(prev => prev - 1);
        timerCount--;
      } else {
        clearInterval(timerInterval);
        disableResend(false);
        setTimer(60);
        timerCount = 60;
      }
    }, 1000);
  };

  // Return the SignUp component
  return (
    <ThemeProvider theme={theme}>
      {!verify ? (
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
                  Sign up
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{mt: 3}}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        onChange={() => {
                          setEmailError(false);
                          setEmailHelper("");
                        }}
                        error={emailError}
                        helperText={emailHelper}
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        autoFocus
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        onChange={() => {
                          setPasswordError(false);
                          setPasswordHelper("");
                        }}
                        error={passwordError}
                        helperText={passwordHelper}
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="new-password"
                      />
                    </Grid>
                  </Grid>
                  <Button
                    disabled={signupButtonState}
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{mt: 3, mb: 2}}>
                    Sign Up
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
                    onClick={signUpWithGoogle}>
                    SignUp with Google
                  </Button>
                  <Button
                    variant={"outlined"}
                    fullWidth
                    sx={{mt: "8px"}}
                    startIcon={<GitHubIcon />}
                    onClick={signUpWithGitHub}>
                    SignUp with GitHub
                  </Button>
                  <Grid container justifyContent="flex-end" sx={{mt: "16px"}}>
                    <Grid item>
                      <Link href="/signin" variant="body2">
                        Already have an account? Sign in
                      </Link>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
              <Copyright sx={{mt: 5}} />
            </Container>
          </Box>
        </Fade>
      ) : (
        <Fade in={true}>
          <Box>
            <Container component="main" maxWidth="lg">
              <Box
                component="form"
                onSubmit={handleAuthCodeSubmit}
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "column",
                  height: "100vh",
                }}>
                <Typography
                  sx={{
                    fontFamily: "Google Sans,Noto Sans,sans-serif",
                    letterSpacing: "-.5px",
                    lineHeight: "1.2em",
                    fontSize: "24px",
                    "@media (min-width:900px)": {fontSize: "30px"},
                    textAlign: "center",
                    mb: "30px",
                  }}>
                  Enter your auth code we sent you by email
                </Typography>
                <TextField
                  onChange={() => {
                    setCodeError(false);
                    setCodeHelper("");
                  }}
                  error={codeError}
                  helperText={codeHelper}
                  autoComplete="authCode"
                  name="authCode"
                  required
                  id="authCode"
                  label="Auth code"
                  autoFocus
                  sx={{maxWidth: "400px", width: "100%"}}
                />
                <Button
                  type="submit"
                  variant="contained"
                  sx={{mt: 3, maxWidth: "400px", width: "100%"}}>
                  Verify
                </Button>
                <Grid
                  container
                  justifyContent="flex-end"
                  maxWidth={"400px"}
                  width={"100%"}
                  mt={3}>
                  <Grid item>
                    <Button
                      size={"small"}
                      onClick={resendCode}
                      disabled={resend}>
                      Resend code {resend ? timer : ""}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Container>
          </Box>
        </Fade>
      )}
    </ThemeProvider>
  );
}
