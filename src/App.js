// Importing necessary modules and components
import * as React from "react";
import {useEffect} from "react";
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {
  Alert,
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Fade,
  Grid,
  IconButton,
  Link,
  Menu,
  MenuItem,
  Snackbar,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import {ReactComponent as FullLogo} from "./assets/clover-cloud-platform-logo-full.svg";
import {ReactComponent as Logo} from "./assets/clover-cloud-platform-logo.svg";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import PlayCircleOutlineRoundedIcon from "@mui/icons-material/PlayCircleOutlineRounded";
import ccp from "./assets/ccp.png";
import WorkspacesRoundedIcon from "@mui/icons-material/WorkspacesRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import ElectricBoltRoundedIcon from "@mui/icons-material/ElectricBoltRounded";
import MemoryRoundedIcon from "@mui/icons-material/MemoryRounded";
import {ReactComponent as HowItWorks} from "./assets/hiw.svg";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import workEl from "./assets/work.svg";
import workEl2 from "./assets/work.svg";
import {ReactComponent as FrontendIcon} from "./assets/frontend.svg";
import {ReactComponent as BackendIcon} from "./assets/backend.svg";
import {ReactComponent as HistoryIcon} from "./assets/history.svg";
import {Link as RouterLink} from "react-router-dom";
import {getAuth, onAuthStateChanged, signOut} from "firebase/auth";
import {initializeApp} from "firebase/app";
import LockResetRoundedIcon from "@mui/icons-material/LockResetRounded";
import ExitToAppRoundedIcon from "@mui/icons-material/ExitToAppRounded";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: "clover-cloud-platform",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};
initializeApp(firebaseConfig);
const auth = getAuth();

//global theme for the app
export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      50: "#f5f3ff",
      100: "#ede9fe",
      200: "#ddd6fe",
      300: "#c4b5fd",
      400: "#a78bfa",
      500: "#8b5cf6",
      600: "#7c3aed",
      700: "#6d28d9",
      800: "#5b21b6",
      900: "#4c1d95",
    },
    background: {
      default: "rgba(33,29,42,0.9)",
      dock: "rgba(255,255,255,0.7)",
      appBar: "#ede9fe",
      cloverAppBar: "#303235",
      cloverMain: "#202124",
    },
    text: {
      primary: "rgba(33,29,42,0.9)",
      secondary: "#5f6368",
      dir: "#a78bfa",
      execDir: "#8b5cf6",
    },
    success: {
      main: "#10b981",
    },
    error: {
      main: "#f43f5e",
    },
    warning: {
      main: "#fb923c",
    },
  },
});

// Defining a functional component ResponsiveAppBar for creating an app bar and navigation menu
const ResponsiveAppBar = () => {
  // Setting states for anchorElNav and appBar
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [appBar, setAppBar] = React.useState(false);
  //state of user menu
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  const [username, setUsername] = React.useState("");
  const [userPhoto, setUserPhoto] = React.useState(null);

  // Getting user info
  useEffect(() => {
    onAuthStateChanged(auth, user => {
      if (user) {
        if (
          user.emailVerified ||
          user.providerData[0].providerId !== "password"
        ) {
          if (user.displayName) {
            setUsername(user.displayName);
          } else {
            setUsername(user.email.split("@")[0]);
          }
          if (user.photoURL) {
            setUserPhoto(user.photoURL);
          }
        }
      }
    });
  }, []);

  // Setting functions to open and close navigation menu
  const handleOpenNavMenu = event => {
    setAnchorElNav(event.currentTarget);
  };
  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  //open/close user menu
  const handleOpenUserMenu = event => {
    setAnchorElUser(event.currentTarget);
  };
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  // Setting function to set the state of appBar based on window scroll Y-axis position
  onscroll = () => {
    if (window.scrollY > 0) {
      setAppBar(true);
    } else {
      setAppBar(false);
    }
  };

  // Render AppBar and navigation menu
  return (
    <AppBar
      position="fixed"
      elevation={appBar ? 4 : 0}
      sx={{
        backgroundColor: "background.appBar",
      }}>
      <Container maxWidth={"xl"}>
        <Toolbar disableGutters>
          <Box sx={{display: {xs: "none", md: "flex"}, mr: 1}}>
            <FullLogo style={{height: "52px", width: "320px"}} />
          </Box>
          <Box sx={{flexGrow: 1, display: {xs: "flex", md: "none"}}}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              sx={{color: "text.primary"}}>
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: {xs: "block", md: "none"},
              }}>
              <MenuItem
                onClick={() => {
                  window.location.href = "https://docs.clovercloud.software";
                }}>
                <Typography textAlign="center">Docs</Typography>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  window.location.href =
                    "https://github.com/Clover-Cloud-Platform";
                }}>
                <Typography textAlign="center">GitHub</Typography>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  window.location.href =
                    "https://github.com/Clover-Cloud-Platform/clover-cloud-platform-frontend/issues";
                }}>
                <Typography textAlign="center">Contact us</Typography>
              </MenuItem>
              <MenuItem key={"Login"} component={RouterLink} to={"/signin"}>
                <Typography textAlign="center">{"Login"}</Typography>
              </MenuItem>
              <MenuItem key={"Sign Up"} component={RouterLink} to={"/signup"}>
                <Typography textAlign="center">{"Sign Up"}</Typography>
              </MenuItem>
            </Menu>
          </Box>
          <Box
            sx={{
              display: {xs: username === "" ? "flex" : "none", md: "none"},
              mr: 1,
            }}>
            <Logo style={{height: "52px", width: "32px"}} />
          </Box>
          <Box sx={{flexGrow: 1, display: {xs: "none", md: "flex"}}}>
            <Button
              href={"https://docs.clovercloud.software"}
              sx={{my: 2, display: "block"}}>
              Docs
            </Button>
            <Button
              href={"https://github.com/Clover-Cloud-Platform"}
              sx={{my: 2, display: "block"}}>
              GitHub
            </Button>
            <Button
              href={
                "https://github.com/Clover-Cloud-Platform/clover-cloud-platform-frontend/issues"
              }
              sx={{my: 2, display: "block"}}>
              Contact us
            </Button>
          </Box>
          {username === "" ? (
            <>
              <Button
                key={"Login"}
                component={RouterLink}
                to={"/signin"}
                sx={{
                  my: 2,
                  display: "block",
                  "@media (max-width:900px)": {display: "none"},
                }}>
                {"Login"}
              </Button>
              <Button
                variant={"outlined"}
                key={"Sign Up"}
                component={RouterLink}
                to={"/signup"}
                sx={{
                  my: 2,
                  display: "block",
                  "@media (max-width:900px)": {display: "none"},
                }}>
                {"Sign Up"}
              </Button>
            </>
          ) : (
            <>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{p: 0}}>
                  <Avatar
                    src={userPhoto}
                    sx={{
                      bgcolor: "primary.200",
                    }}>
                    {username ? username.split("")[0].toUpperCase() : ""}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                sx={{mt: "45px"}}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}>
                <MenuItem
                  onClick={handleCloseUserMenu}
                  style={{opacity: 1}}
                  disabled>
                  <Avatar
                    src={userPhoto}
                    sx={{
                      height: "24px",
                      width: "24px",
                      bgcolor: "primary.200",
                    }}
                  />
                  <Typography
                    textAlign="center"
                    color={"primary.500"}
                    ml={"8px"}>
                    {username}
                  </Typography>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    window.location.href = "/instances";
                  }}>
                  <DashboardOutlinedIcon />
                  <Typography textAlign="center" ml={"8px"}>
                    Go to dashboard
                  </Typography>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    window.location.href = "/reset";
                  }}>
                  <LockResetRoundedIcon />
                  <Typography textAlign="center" ml={"8px"}>
                    Reset password
                  </Typography>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    signOut(auth).then(() => {
                      window.location.href = "/signin";
                    });
                  }}>
                  <ExitToAppRoundedIcon />
                  <Typography textAlign="center" ml={"8px"}>
                    Log out
                  </Typography>
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

// Component for showing project features
const Tile = props => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        flexBasis: "317px",
        maxWidth: "317px",
        mt: "60px",
      }}>
      <Avatar
        alt={props.title}
        sx={{bgcolor: "primary.50", width: 64, height: 64}}>
        {props.icon}
      </Avatar>
      <Typography
        color={"text.primary"}
        mt={"15px"}
        sx={{fontSize: "30px", "@media (max-width:900px)": {fontSize: "24px"}}}>
        {props.title}
      </Typography>
      <Typography
        variant={"subtitle1"}
        mt={"15px"}
        textAlign={"center"}
        color={"text.secondary"}>
        {props.subtitle}
      </Typography>
    </Box>
  );
};

// Component for displaying project repos
const Repo = props => {
  return (
    <Card variant="outlined" sx={{height: "100%"}}>
      <CardContent>
        <Typography
          sx={{fontSize: 12}}
          fontWeight={500}
          color="#73767a"
          gutterBottom>
          {props.name}
        </Typography>
        <Box
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}>
          <Link href={props.link} variant="body2">
            {props.repoName}
          </Link>
          {props.icon}
        </Box>
      </CardContent>
    </Card>
  );
};

// export App and render it
export default function App() {
  const [openCookieWarning, setOpenCookieWarning] = React.useState(false);

  useEffect(() => {
    // Show cookie warning
    if (!localStorage.getItem("DoNotShowCookieWarning")) {
      setOpenCookieWarning(true);
    }
    // Set title
    document.title = "Clover Cloud Platform";

    // Change theme color
    document
      .querySelector('meta[name="theme-color"]')
      .setAttribute("content", "#ede9fe");
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <ResponsiveAppBar />
      <Fade in={true}>
        <Box>
          <Box
            width={"85vw"}
            maxWidth={"1500px"}
            ml={"auto"}
            mr={"auto"}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              "@media (max-width:900px)": {
                flexDirection: "column",
                width: "90vw",
              },
            }}>
            <Box
              mt={"130px"}
              mr={"10px"}
              maxWidth={"550px"}
              sx={{"@media (max-width:900px)": {maxWidth: "100%", mr: 0}}}>
              <Button
                component={RouterLink}
                to={"/signup"}
                variant={"outlined"}
                endIcon={<ArrowCircleRightIcon />}
                sx={{
                  textTransform: "none",
                  fontWeight: "normal",
                  whiteSpace: "pre",
                  "@media (max-width:900px)": {width: "100%"},
                }}>
                <b>Register now</b> to join Clover Cloud Platform
              </Button>
              <Typography
                sx={{
                  background: "linear-gradient(0deg, #8b5cf6 0%, #14b8a6 100%)",
                  backgroundClip: "text",
                  color: "transparent",
                  fontFamily: "Google Sans,Noto Sans,sans-serif",
                  letterSpacing: "-.5px",
                  lineHeight: "1.2em",
                  fontWeight: "600",
                  fontSize: "8vw",
                  mt: "30px",
                  "@media (min-width:900px)": {fontSize: "60px"},
                }}>
                Simulate, test, and code with Clover Cloud
              </Typography>
              <Typography
                fontSize={"18px"}
                mt={"17px"}
                sx={{letterSpacing: "-.2px"}}>
                Get access to Clover simulation in browser, test code faster,
                and learn drones easier.
              </Typography>
              <Box mt={"32px"}>
                <Button
                  component={RouterLink}
                  to={"/signup"}
                  variant={"contained"}
                  size={"large"}
                  sx={{
                    width: "200px",
                    "@media (max-width:900px)": {width: "100%"},
                  }}>
                  Get started
                </Button>
                <Button
                  href={"https://docs.clovercloud.software"}
                  variant={"outlined"}
                  size={"large"}
                  sx={{
                    ml: "16px",
                    width: "200px",
                    "@media (max-width:900px)": {
                      width: "100%",
                      ml: 0,
                      mt: "10px",
                    },
                  }}>
                  Documentation
                </Button>
              </Box>
            </Box>
            <Box
              onClick={() => {
                window
                  .open("https://www.youtube.com/watch?v=FZPl2LOMgi4", "_blank")
                  .focus();
              }}
              mb={"-30px"}
              position={"relative"}
              mt={"40px"}
              sx={{
                cursor: "pointer",
                "@media (min-width:900px)": {
                  mt: "130px",
                  maxWidth: "500px",
                },
              }}>
              <img
                src={ccp}
                alt={"overview"}
                style={{
                  borderRadius: "28px",
                  width: "100%",
                  maxWidth: "100%",
                  minWidth: "320px",
                  height: "90vw",
                  maxHeight: "500px",
                  objectFit: "cover",
                  boxShadow: "0 14px 15px -12px #767575",
                }}
              />
              <PlayCircleOutlineRoundedIcon
                sx={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: 0,
                  right: 0,
                  m: "auto",
                  fontSize: "70px",
                  color: "background.default",
                  cursor: "pointer",
                }}
              />
            </Box>
          </Box>
          <Box
            width={"100%"}
            bgcolor={"primary.50"}
            pt={"40px"}
            pb={"40px"}
            sx={{"@media (max-width:900px)": {pt: "60px"}}}>
            <Box width={"85vw"} maxWidth={"1500px"} ml={"auto"} mr={"auto"}>
              <Typography
                sx={{
                  fontFamily: "Google Sans,Noto Sans,sans-serif",
                  fontSize: "20px",
                  color: "text.primary",
                  "@media (max-width:900px)": {
                    fontSize: "18px",
                    textAlign: "center",
                    width: "100%",
                  },
                }}>
                Source code of the project
              </Typography>
              <Box pt={"3px"} mt={"20px"} bgcolor={"#e8eaed"}></Box>
              <Grid container mt={"30px"} spacing={2}>
                <Grid item xs>
                  <Repo
                    name={"FRONTEND"}
                    link={
                      "https://github.com/Clover-Cloud-Platform/clover-cloud-platform-frontend"
                    }
                    repoName={
                      "Clover-Cloud-Platform/clover-cloud-platform-frontend"
                    }
                    icon={
                      <FrontendIcon style={{width: "80px", height: "80px"}} />
                    }
                  />
                </Grid>
                <Grid item xs>
                  <Repo
                    name={"BACKEND"}
                    link={
                      "https://github.com/Clover-Cloud-Platform/clover-cloud-platform-backend"
                    }
                    repoName={
                      "Clover-Cloud-Platform/clover-cloud-platform-backend"
                    }
                    icon={
                      <BackendIcon style={{width: "80px", height: "80px"}} />
                    }
                  />
                </Grid>
                <Grid item xs>
                  <Repo
                    name={"UPDATES HISTORY"}
                    link={"https://github.com/CopterExpress/clover/pull/455"}
                    repoName={"CopterExpress/clover/pull/455"}
                    icon={
                      <HistoryIcon style={{width: "48px", height: "80px"}} />
                    }
                  />
                </Grid>
              </Grid>
            </Box>
          </Box>
          <Box sx={{mt: "30px"}}>
            <Box
              width={"85vw"}
              maxWidth={"1500px"}
              m={"auto"}
              sx={{
                "@media (max-width:900px)": {
                  width: "90vw",
                  flexDirection: "column",
                },
              }}
              pb={"50px"}
              display={"flex"}
              alignItems={"center"}
              justifyContent={"center"}>
              <Typography
                sx={{
                  textAlign: "center",
                  fontFamily: "Google Sans,Noto Sans,sans-serif",
                  letterSpacing: "-.5px",
                  lineHeight: "1.2em",
                  fontWeight: "600",
                  fontSize: "7vw",
                  mt: "60px",
                  color: "text.primary",
                  "@media (min-width:900px)": {fontSize: "40px"},
                }}>
                The platform you've always wanted.
              </Typography>
              <Box
                ml={"130px"}
                display={"flex"}
                flexWrap={"wrap"}
                justifyContent={"space-between"}
                sx={{
                  "@media (max-width:900px)": {
                    ml: 0,
                    justifyContent: "center",
                  },
                }}>
                <Tile
                  icon={<WorkspacesRoundedIcon sx={{width: 34, height: 34}} />}
                  alt={"User-friendly"}
                  title={"User-friendly"}
                  subtitle={
                    "The workspace of the Clover Cloud Platform is user-friendly and any user can understand it, even without reading the documentation."
                  }
                />
                <Tile
                  icon={<LanguageRoundedIcon sx={{width: 34, height: 34}} />}
                  alt={"Accessible"}
                  title={"Accessible"}
                  subtitle={
                    "You can access the simulator in seconds from any device."
                  }
                />
                <Tile
                  icon={
                    <ElectricBoltRoundedIcon sx={{width: 34, height: 34}} />
                  }
                  alt={"Fast"}
                  title={"Fast"}
                  subtitle={
                    "We use WebSockets technology, so you will get instant response and real time simulation."
                  }
                />
                <Tile
                  icon={<MemoryRoundedIcon sx={{width: 34, height: 34}} />}
                  alt={"Undemanding"}
                  title={"Undemanding"}
                  subtitle={
                    "This platform does not require the installation of any software on your PC or powerful hardware - everything runs on our servers."
                  }
                />
              </Box>
            </Box>
          </Box>
          <Box
            bgcolor={"#000"}
            pb={"100px"}
            position={"relative"}
            sx={{"@media (max-width:900px)": {pb: "70px"}}}>
            <Box
              sx={{
                mt: "-1px",
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                overflow: "hidden",
                lineHeight: 0,
                "@media (max-width:900px)": {display: "none"},
              }}>
              <svg
                style={{
                  position: "relative",
                  display: "block",
                  width: "100%",
                  height: "80px",
                }}
                data-name="Layer 1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1200 120"
                preserveAspectRatio="none">
                <path
                  style={{fill: "#FFFFFF"}}
                  d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
                  className="shape-fill"></path>
              </svg>
            </Box>
            <Typography
              pt={"70px"}
              textAlign={"center"}
              color={"#fff"}
              sx={{
                fontFamily: "Google Sans,Noto Sans,sans-serif",
                letterSpacing: "-.5px",
                lineHeight: "1.2em",
                fontWeight: "600",
                fontSize: "7vw",
                "@media (min-width:900px)": {fontSize: "50px", pt: "100px"},
              }}>
              How it works
            </Typography>
            <Typography
              fontSize={"25px"}
              color={"#fff"}
              textAlign={"center"}
              mt={"30px"}
              ml={"auto"}
              mr={"auto"}
              maxWidth={"1000px"}
              sx={{
                "@media (max-width:900px)": {
                  maxWidth: "90vw",
                  fontSize: "20px",
                },
              }}>
              Clover Cloud is an{" "}
              <span style={{color: "#1be3cd", display: "inline"}}>
                open source platform
              </span>{" "}
              that provides users with access to a{" "}
              <span style={{color: "#a78bfa", display: "inline"}}>
                drone simulation
              </span>{" "}
              by running it on our servers and streaming data to the frontend,
              as well as a{" "}
              <span style={{color: "#a78bfa", display: "inline"}}>
                set of tools
              </span>{" "}
              to comfortably work with the simulator.
            </Typography>
            <Box
              width={"800px"}
              height={"auto"}
              border={"solid 2px #444"}
              borderRadius={"28px"}
              ml={"auto"}
              mr={"auto"}
              mt={"70px"}
              p={"20px"}
              mb={"70px"}
              sx={{"@media (max-width:900px)": {display: "none"}}}>
              <HowItWorks width={"800px"} height={"450px"} />
            </Box>
            <Box
              sx={{
                position: "absolute",
                bottom: -1,
                left: 0,
                width: "100%",
                overflow: "hidden",
                lineHeight: 0,
                transform: "rotate(180deg)",
                "@media (max-width:900px)": {display: "none"},
              }}>
              <svg
                style={{
                  position: "relative",
                  display: "block",
                  width: "100%",
                  height: "80px",
                }}
                data-name="Layer 1"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1200 120"
                preserveAspectRatio="none">
                <path
                  d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
                  opacity=".25"
                  style={{fill: "#FFFFFF"}}></path>
                <path
                  d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
                  opacity=".5"
                  style={{fill: "#FFFFFF"}}></path>
                <path
                  d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
                  style={{fill: "#FFFFFF"}}></path>
              </svg>
            </Box>
          </Box>
          <Box
            sx={{
              mt: "120px",
              mb: "100px",
              ml: "auto",
              mr: "auto",
              width: "90vw",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}>
            <Box
              maxWidth={"650px"}
              sx={{
                "@media (min-width:900px)": {mr: "120px"},
                "@media (max-width:900px)": {
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: "90vw",
                },
              }}>
              <Box sx={{"@media (min-width:900px)": {display: "none"}}}>
                <img src={workEl2} alt={"Sign Up"} width={"300px"} />
              </Box>
              <Typography
                sx={{
                  mt: "40px",
                  fontFamily: "Google Sans,Noto Sans,sans-serif",
                  letterSpacing: "-.5px",
                  lineHeight: "1.2em",
                  fontWeight: "600",
                  fontSize: "30px",
                  "@media (max-width:900px)": {
                    fontSize: "6vw",
                    textAlign: "center",
                  },
                }}>
                Get started with easy-to-use Clover Cloud Platform.
              </Typography>
              <Typography
                mt={"25px"}
                mb={"25px"}
                fontSize={"18px"}
                sx={{
                  letterSpacing: "-.2px",
                  "@media (max-width:900px)": {
                    textAlign: "center",
                  },
                }}
                color={"text.primary"}>
                Clover Cloud Platform is the fastest way to test your code on
                Clover. Run your scripts on our servers and watch the real time
                drone simulation.
              </Typography>
              <Button
                component={RouterLink}
                to={"/signup"}
                sx={{
                  "@media (max-width:900px)": {
                    width: "100%",
                  },
                }}
                variant={"contained"}
                endIcon={<KeyboardArrowRightRoundedIcon />}>
                Sign Up
              </Button>
            </Box>
            <Box sx={{"@media (max-width:900px)": {display: "none"}}}>
              <img src={workEl} alt={"Sign Up"} width={"450px"} />
            </Box>
          </Box>
          <Box
            borderTop={"solid 1px #bbb"}
            display={"flex"}
            justifyContent={"space-between"}
            sx={{
              "@media (max-width:900px)": {
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              },
            }}
            pt={"20px"}
            pb={"20px"}
            ml={"20px"}
            mr={"20px"}>
            <Typography fontSize={"16px"} color={"text.primary"}>
              <Link
                href="https://github.com/Clover-Cloud-Platform/clover-cloud-platform-frontend/blob/master/PRIVACYPOLICY.md"
                underline="none"
                color={"inherit"}
                sx={{"&:hover": {color: "primary.500"}}}>
                Privacy Policy
              </Link>{" "}
              |{" "}
              <Link
                href="https://github.com/Clover-Cloud-Platform/clover-cloud-platform-frontend/blob/master/LICENSE"
                underline="none"
                color={"inherit"}
                sx={{"&:hover": {color: "primary.500"}}}>
                License
              </Link>{" "}
              |{" "}
              <Link
                href="mailto:clover.cloud.platform@yandex.ru"
                underline="none"
                color={"inherit"}
                sx={{"&:hover": {color: "primary.500"}}}>
                Contact us via email
              </Link>
            </Typography>
            <Typography
              fontSize={"16px"}
              color={"text.secondary"}
              sx={{"@media (max-width:900px)": {mt: "10px"}}}>
              © Clover Cloud Team {new Date().getFullYear()}
            </Typography>
          </Box>
        </Box>
      </Fade>
      <Snackbar
        open={openCookieWarning}
        ContentProps={{style: {backgroundColor: "#fff"}}}
        anchorOrigin={{vertical: "bottom", horizontal: "center"}}
        action={
          <Button
            size="small"
            onClick={() => {
              localStorage.setItem("DoNotShowCookieWarning", "true");
              setOpenCookieWarning(false);
            }}>
            Accept and do not show this again
          </Button>
        }
        message={
          "This site uses Cookies to collect information and report usage statistics."
        }
        onClose={() => {
          setOpenCookieWarning(false);
        }}
      />
    </ThemeProvider>
  );
}
