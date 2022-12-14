import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import {ThemeProvider} from "@mui/material/styles";
import {theme} from "../App";
import Fade from "@mui/material/Fade";
import {io} from "socket.io-client";
import {initializeApp} from "firebase/app";
import {getAnalytics, logEvent} from "firebase/analytics";
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
const analytics = getAnalytics(app);

const socket = io(process.env.REACT_APP_SERVER_LINK);

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

  const handleSubmit = event => {
    event.preventDefault();
    disableSignupButton(true);
    const data = new FormData(event.currentTarget);
    const username = data.get("username").trim();
    const email = data.get("email").trim();
    const password = data.get("password");
    if (!emailRegex.test(email)) {
      disableSignupButton(false);
      setEmailError(true);
      setEmailHelper("Invalid email");
    } else if (!passwordRegex.test(password)) {
      disableSignupButton(false);
      setPasswordError(true);
      setPasswordHelper(
        "Password must contain minimum 6 characters, at least one letter and one number",
      );
    } else {
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
      socket.emit("SignUp", {
        email: email,
      });
      socket.on("SignUpRes", res => {
        if (res.error) {
          disableSignupButton(false);
          setEmailError(true);
          setEmailHelper("There is already an account with this email");
        } else if (!res.error && res.code) {
          setAuthCode(res.code);
          setVerify(true);
          setUserData({email: email, username: username, password: password});
        }
      });
    }
  };

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
        localStorage.setItem("containers", JSON.stringify([false, false]));
        window.location.href = "/instances";
      });
    } else {
      setCodeError(true);
      setCodeHelper("Invalid auth code");
    }
  };

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
                          setUsernameError(false);
                          setUsernameHelper("");
                        }}
                        error={usernameError}
                        helperText={usernameHelper}
                        autoComplete="username"
                        name="username"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        autoFocus
                      />
                    </Grid>
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
                  <Grid container justifyContent="flex-end">
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
