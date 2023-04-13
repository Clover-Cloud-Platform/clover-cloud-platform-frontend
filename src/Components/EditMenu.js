import * as React from "react";
import Menu from "@mui/material/Menu";
import {theme} from "../App";
import {ThemeProvider} from "@mui/material/styles";

// A pop-up component for inputs in the file manager
export default function EditMenu(props) {
  return (
    <ThemeProvider theme={theme}>
      <Menu
        {...props}
        PaperProps={{
          elevation: 0,
          sx: {
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            backdropFilter: "blur(5px)",
            bgcolor: "rgba(42,41,49,0.5)",
            color: "primary.50",
          },
        }}>
        {props.children}
      </Menu>
    </ThemeProvider>
  );
}
