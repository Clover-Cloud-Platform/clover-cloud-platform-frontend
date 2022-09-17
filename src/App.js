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
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import {ReactComponent as FullLogo} from "./assets/clover-cloud-platform-logo-full.svg";
import {ReactComponent as Logo} from "./assets/clover-cloud-platform-logo.svg";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import PlayCircleOutlineRoundedIcon from "@mui/icons-material/PlayCircleOutlineRounded";
import ccp from "./assets/ccp.png";

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
      appBar: "#ddd6fe",
    },
    text: {
      primary: "rgba(33,29,42,0.9)",
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
    <AppBar position="fixed" sx={{bgcolor: theme.palette.background.appBar}}>
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
              sx={{color: theme.palette.text.primary}}>
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
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <ResponsiveAppBar />
      <Container
        maxWidth={"lg"}
        sx={{
          display: "flex",
          justifyContent: "space-between",
          "@media (max-width:900px)": {flexDirection: "column"},
        }}>
        <Box mt={"130px"} maxWidth={"550px"}>
          <Button
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
            Get access to Clover simulation in browser, test code faster, and
            learn drones easier.
          </Typography>
          <Box mt={"32px"}>
            <Button
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
          mt={"130px"}
          position={"relative"}
          sx={{"@media (max-width:900px)": {mt: "50px"}}}>
          <img
            src={ccp}
            alt={"overview"}
            style={{
              borderRadius: "28px",
              cursor: "pointer",
              maxWidth: "440px",
              width: "100%",
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
              color: theme.palette.background.default,
              cursor: "pointer",
            }}
          />
        </Box>
      </Container>
    </ThemeProvider>
  );
}
