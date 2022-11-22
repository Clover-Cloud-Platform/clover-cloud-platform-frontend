import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import {ThemeProvider} from "@mui/material/styles";
import {theme} from "../App";
import Fade from "@mui/material/Fade";
import {emailRegex} from "./SignUp";
import {io} from "socket.io-client";

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

export default function SignIn() {
  const [emailError, setEmailError] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState(false);
  const [emailHelper, setEmailHelper] = React.useState("");
  const [passwordHelper, setPasswordHelper] = React.useState("");

  const handleSubmit = event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = data.get("email").trim();
    const password = data.get("password");
    const remember = data.get("remember");
    if (!emailRegex.test(email)) {
      setEmailError(true);
      setEmailHelper("Invalid email");
    } else {
      socket.emit("SignIn", {email: email, password: password});
      socket.on("SignInRes", res => {
        if (res.error === "email") {
          setEmailError(true);
          setEmailHelper("No account with this email");
        } else if (res.error === "password") {
          setPasswordError(true);
          setPasswordHelper("Invalid password");
        } else if (!res.error && res.uid) {
          if (remember) {
            localStorage.setItem("uid", res.uid);
          } else {
            sessionStorage.setItem("uid", res.uid);
          }
          window.location.href = "/instances";
        }
      });
    }
  };

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
