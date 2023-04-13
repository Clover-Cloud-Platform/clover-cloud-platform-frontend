// Importing necessary modules and components
import * as React from "react";
import {useEffect} from "react";
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Container,
  Fade,
  FormControlLabel,
  Grid,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {ThemeProvider} from "@mui/material/styles";
import {theme} from "../App";
import {emailRegex} from "./SignUp";
import {socket} from "./Instances";

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
  // Define states for email error, password error, email helper and password halper
  const [emailError, setEmailError] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState(false);
  const [emailHelper, setEmailHelper] = React.useState("");
  const [passwordHelper, setPasswordHelper] = React.useState("");

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
    const remember = data.get("remember");

    // Check email
    if (!emailRegex.test(email)) {
      setEmailError(true);
      setEmailHelper("Invalid email");
    } else {
      // Send sign in request to the server
      socket.emit("SignIn", {email: email, password: password});
      // Handle response
      socket.on("SignInRes", res => {
        // Check errors
        if (res.error === "email") {
          setEmailError(true);
          setEmailHelper("No account with this email");
        } else if (res.error === "password") {
          setPasswordError(true);
          setPasswordHelper("Invalid password");
        } else if (!res.error && res.uid) {
          // Set uid to the storage
          if (remember) {
            localStorage.setItem("uid", res.uid);
          } else {
            sessionStorage.setItem("uid", res.uid);
          }
          // Move user to the dashboard
          window.location.href = "/instances";
        }
      });
    }
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
                <TextField
                  error={passwordError}
                  helperText={passwordHelper}
                  onChange={() => {
                    setPasswordError(false);
                    setPasswordHelper("");
                  }}
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked
                      value="remember"
                      name="remember"
                      color="primary"
                    />
                  }
                  label="Remember me"
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{mt: 3, mb: 2}}>
                  Sign In
                </Button>
                <Grid container>
                  <Grid item xs>
                    <Link href="#" variant="body2">
                      Forgot password?
                    </Link>
                  </Grid>
                  <Grid item>
                    <Link href="/signup" variant="body2">
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
    </ThemeProvider>
  );
}
