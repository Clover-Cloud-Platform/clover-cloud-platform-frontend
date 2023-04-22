import React from "react";
import {ThemeProvider} from "@mui/material/styles";
import {theme} from "../App";
import {Box, Typography} from "@mui/material";
import Button from "@mui/material/Button";

export default function NotFound() {
  return (
    <ThemeProvider theme={theme}>
      <Box
        width={"100%"}
        height={"100vh"}
        display={"flex"}
        alignItems={"center"}
        justifyContent={"center"}
        flexDirection={"column"}
        gap={"50px"}>
        <Typography
          color={"error"}
          sx={{
            fontFamily: "Google Sans,Noto Sans,sans-serif",
            letterSpacing: "-.5px",
            lineHeight: "1.2em",
            fontSize: "48px",
            "@media (min-width:900px)": {fontSize: "60px"},
            textAlign: "center",
          }}>
          404
        </Typography>
        <Typography
          sx={{
            color: "text.primary",
            fontFamily: "Google Sans,Noto Sans,sans-serif",
            letterSpacing: "-.5px",
            lineHeight: "1.2em",
            fontSize: "24px",
            "@media (min-width:900px)": {fontSize: "30px"},
            textAlign: "center",
          }}>
          We couldn't find this page.
        </Typography>
        <Button href={"/"} variant={"outlined"}>
          Go to HomePage
        </Button>
      </Box>
    </ThemeProvider>
  );
}
