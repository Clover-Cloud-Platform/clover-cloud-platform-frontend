import * as React from "react";
import {useEffect} from "react";
import {
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
  Link,
  OutlinedInput,
  Typography,
  InputLabel,
  Alert,
  Snackbar,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import GoogleIcon from "@mui/icons-material/Google";
import GitHubIcon from "@mui/icons-material/GitHub";
import {ThemeProvider} from "@mui/material/styles";
import {theme} from "../App";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import IconButton from "@mui/material/IconButton";
import {ContainerBox, Text} from "./Action";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
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

// Function that renders SignUp component
export default function SignUp() {
  const [emailError, setEmailError] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState(false);
  const [emailHelper, setEmailHelper] = React.useState("");
  const [passwordHelper, setPasswordHelper] = React.useState("");
  const [signupButtonState, disableSignupButton] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [fadeSignUp, setFadeSignUp] = React.useState(true);
  const [signUp, setSignUp] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");

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
          setFadeSignUp(false);
          setTimeout(() => {
            setSignUp(false);
          }, 300);
          sendEmailVerification(user);
        })
        .catch(error => {
          const errorMessage = error.message;
          setErrorText(errorMessage);
          setError(true);
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
        // Handle Errors.
        const errorMessage = error.message;
        setErrorText(errorMessage);
        setError(true);
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
        // Handle Errors.
        const errorMessage = error.message;
        setErrorText(errorMessage);
        setError(true);
      });
  };

  // Return the SignUp component
  return (
    <ThemeProvider theme={theme}>
      {signUp ? (
        <Fade in={fadeSignUp}>
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
                      <FormControl
                        variant="outlined"
                        sx={{width: "100%"}}
                        error={emailError}>
                        <InputLabel htmlFor="email">Email Address</InputLabel>
                        <OutlinedInput
                          onChange={() => {
                            setEmailError(false);
                            setEmailHelper("");
                          }}
                          required
                          fullWidth
                          label={"EmailAddress"}
                          id="email"
                          name="email"
                          autoComplete="email"
                          autoFocus
                          aria-describedby="email-helper-text"
                        />
                        <FormHelperText id="email-helper-text">
                          {emailHelper}
                        </FormHelperText>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl
                        variant="outlined"
                        sx={{width: "100%"}}
                        error={passwordError}>
                        <InputLabel htmlFor="password">Password</InputLabel>
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
                                {showPassword ? (
                                  <VisibilityOff />
                                ) : (
                                  <Visibility />
                                )}
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
            <ContainerBox>
              <MailOutlineRoundedIcon color={"primary"} fontSize={"large"} />
              <Text>
                Please check your email. We have sent you a link to activate
                your account.
              </Text>
            </ContainerBox>
          </Box>
        </Fade>
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
