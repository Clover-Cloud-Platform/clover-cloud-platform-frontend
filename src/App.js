import * as React from "react";
import Box from "@mui/material/Box";
import {createTheme, ThemeProvider} from "@mui/material/styles";
import wallpaper from "./assets/wallpaper.jpg";
import Terminal from "./Components/Terminal";
import Dock from "./Components/Dock";
function App() {
  const theme = createTheme({
    palette: {
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
      },
      text: {
        primary: "#fff",
        dir: "#a78bfa",
        execDir: "#8b5cf6",
      },
    },
  });
  return (
    <ThemeProvider theme={theme}>
      <Box
        position={"relative"}
        width={"100%"}
        height={"100vh"}
        overflow={"hidden"}
        sx={{
          backgroundImage: `url(${wallpaper})`,
          backgroundSize: "cover",
        }}>
        <Terminal />
        <Dock />
      </Box>
    </ThemeProvider>
  );
}

export default App;
