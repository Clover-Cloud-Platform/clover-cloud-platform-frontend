import * as React from "react";
import Box from "@mui/material/Box";
import {getMaterialFileIcon} from "file-extension-icon-js";
import Typography from "@mui/material/Typography";
import {Divider} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import IconButton from "@mui/material/IconButton";
import {workspaceTheme} from "./MainApp";
import {ThemeProvider} from "@mui/material/styles";

export default function EditorFile(props) {
  return (
    <ThemeProvider theme={workspaceTheme}>
      <Box
        display={"flex"}
        alignItems={"center"}
        justifyContent={"center"}
        gap={"5px"}>
        <img
          style={{marginLeft: "8px"}}
          src={getMaterialFileIcon(props.name)}
          alt={props.name}
          width="22px"
          height={"22px"}
        />
        <Typography
          color={"primary.50"}
          sx={{
            fontSize: "15px",
            overflow: "hidden",
          }}>
          {props.name}
        </Typography>
        <IconButton aria-label="close" size="small" sx={{ml: "4px"}}>
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </Box>
      <Divider orientation={"vertical"} sx={{ml: "8px", bgcolor: "#33313f"}} />
    </ThemeProvider>
  );
}
