import * as React from "react";
import {createTheme, ThemeProvider} from "@mui/material/styles";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import {ReactComponent as FullLogo} from "./assets/clover-cloud-platform-logo-full.svg";
import {ReactComponent as Logo} from "./assets/clover-cloud-platform-logo.svg";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import PlayCircleOutlineRoundedIcon from "@mui/icons-material/PlayCircleOutlineRounded";
import ccp from "./assets/ccp.png";
import {Avatar, Link} from "@mui/material";
import WorkspacesRoundedIcon from "@mui/icons-material/WorkspacesRounded";
import LanguageRoundedIcon from "@mui/icons-material/LanguageRounded";
import ElectricBoltRoundedIcon from "@mui/icons-material/ElectricBoltRounded";
import MemoryRoundedIcon from "@mui/icons-material/MemoryRounded";
import connection from "./assets/hiw/connection.svg";
import appIcon from "./assets/hiw/app.svg";
import files from "./assets/dock/files.svg";
import terminal from "./assets/dock/terminal.svg";
import vscode from "./assets/dock/vscode.svg";
import environment from "./assets/hiw/env.svg";
import shareEl from "./assets/hiw/share.svg";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import workEl from "./assets/hiw/work.svg";
import Fade from "@mui/material/Fade";

//global theme for the whole app
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
    },
    text: {
      primary: "rgba(33,29,42,0.9)",
      secondary: "#5f6368",
      dir: "#a78bfa",
      execDir: "#8b5cf6",
    },
  },
});

const pages = ["Docs", "GitHub", "Contact us"];

const ResponsiveAppBar = () => {
  const [anchorElNav, setAnchorElNav] = React.useState(null);

  const handleOpenNavMenu = event => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <AppBar position="fixed" sx={{bgcolor: "background.appBar"}}>
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
              {pages.map(page => (
                <MenuItem key={page} onClick={handleCloseNavMenu}>
                  <Typography textAlign="center">{page}</Typography>
                </MenuItem>
              ))}
              <MenuItem key={"Login"} href={"/signin"}>
                <Typography textAlign="center">{"Login"}</Typography>
              </MenuItem>
              <MenuItem key={"Sign Up"} onClick={handleCloseNavMenu}>
                <Typography textAlign="center">{"Sign Up"}</Typography>
              </MenuItem>
            </Menu>
          </Box>
          <Box
            sx={{
              display: {xs: "flex", md: "none"},
              mr: 1,
            }}>
            <Logo style={{height: "52px", width: "32px"}} />
          </Box>
          <Box sx={{flexGrow: 1, display: {xs: "none", md: "flex"}}}>
            {pages.map(page => (
              <Button
                key={page}
                onClick={handleCloseNavMenu}
                sx={{my: 2, display: "block"}}>
                {page}
              </Button>
            ))}
          </Box>
          <Button
            key={"Login"}
            href={"/signin"}
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
            href={"/signup"}
            sx={{
              my: 2,
              display: "block",
              "@media (max-width:900px)": {display: "none"},
            }}>
            {"Sign Up"}
          </Button>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

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
      <Avatar alt={props.title} sx={{bgcolor: "#fff", width: 64, height: 64}}>
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

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <ResponsiveAppBar />
      <Fade in={true}>
        <Box>
          <Box
            width={"85vw"}
            m={"auto"}
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
              maxWidth={"550px"}
              sx={{"@media (max-width:900px)": {maxWidth: "100%"}}}>
              <Button
                href={"/signup"}
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
                  href={"/signup"}
                  variant={"contained"}
                  size={"large"}
                  sx={{
                    width: "200px",
                    "@media (max-width:900px)": {width: "100%"},
                  }}>
                  Get started
                </Button>
              </Box>
            </Box>
            <Box
              mt={"50px"}
              position={"relative"}
              sx={{
                "@media (min-width:900px)": {mt: "130px", maxWidth: "440px"},
              }}>
              <img
                src={ccp}
                alt={"overview"}
                style={{
                  borderRadius: "28px",
                  cursor: "pointer",
                  width: "100%",
                  maxWidth: "100%",
                  height: "100%",
                  "@media (maxWidth:900px)": {maxWidth: "440px"},
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
          <Box bgcolor={"primary.50"} mt={"70px"}>
            <Box
              width={"85vw"}
              m={"auto"}
              sx={{
                "@media (max-width:900px)": {
                  width: "90vw",
                  flexDirection: "column",
                },
              }}
              mt={"30px"}
              pb={"30px"}
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
          <Box bgcolor={"#000"} pt={"100px"} pb={"100px"}>
            <Typography
              textAlign={"center"}
              color={"#fff"}
              sx={{
                fontFamily: "Google Sans,Noto Sans,sans-serif",
                letterSpacing: "-.5px",
                lineHeight: "1.2em",
                fontWeight: "600",
                fontSize: "7vw",
                "@media (min-width:900px)": {fontSize: "50px"},
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
              maxWidth={"1000px"}
              minWidth={"760px"}
              border={"solid 2px #444"}
              borderRadius={"28px"}
              ml={"auto"}
              mr={"auto"}
              mt={"70px"}
              sx={{"@media (max-width:900px)": {display: "none"}}}>
              <Box
                position={"relative"}
                width={"760px"}
                mt={"50px"}
                mb={"50px"}
                left={"50%"}
                sx={{transform: "translateX(-50%)"}}>
                <img src={connection} alt={"connection"} width={"300px"} />
                <img
                  src={shareEl}
                  alt={"share"}
                  width={"250px"}
                  style={{position: "absolute", top: "116.4px", left: "515px"}}
                />
                <Box
                  width={"340px"}
                  height={"180px"}
                  bgcolor={"#000"}
                  position={"absolute"}
                  left={"170px"}
                  top={"60px"}
                  borderRadius={"16px"}
                  border={"2px solid #1b1b1b"}>
                  <Box
                    position={"relative"}
                    m={"3px"}
                    bgcolor={"#121212"}
                    width={"334px"}
                    height={"174px"}
                    borderRadius={"12px"}>
                    <img
                      src={environment}
                      width={"200px"}
                      style={{marginLeft: "67px", marginTop: "4px"}}
                      alt={"environment"}
                    />
                    <img
                      src={files}
                      alt={"files"}
                      width={"60px"}
                      style={{position: "absolute", top: "85px", left: "19px"}}
                    />
                    <img
                      src={terminal}
                      alt={"files"}
                      width={"50px"}
                      style={{position: "absolute", top: "90px", left: "102px"}}
                    />
                    <img
                      src={vscode}
                      alt={"files"}
                      width={"50px"}
                      style={{position: "absolute", top: "90px", left: "181px"}}
                    />
                    <img
                      src={appIcon}
                      alt={"runApp"}
                      width={"160px"}
                      style={{position: "absolute", top: "78px", left: "250px"}}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
          <Box
            sx={{
              mt: "150px",
              mb: "150px",
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
              <Typography
                sx={{
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
                href={"/signup"}
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
                href="#"
                underline="none"
                color={"inherit"}
                sx={{"&:hover": {color: "primary.500"}}}>
                Privacy Policy
              </Link>{" "}
              |{" "}
              <Link
                href="#"
                underline="none"
                color={"inherit"}
                sx={{"&:hover": {color: "primary.500"}}}>
                License
              </Link>{" "}
              |{" "}
              <Link
                href="#"
                underline="none"
                color={"inherit"}
                sx={{"&:hover": {color: "primary.500"}}}>
                Terms of Use
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
    </ThemeProvider>
  );
}
