import * as React from "react";
import {theme} from "../App";
import {ThemeProvider} from "@mui/material/styles";
import {
  getMaterialFileIcon,
  getMaterialFolderIcon,
} from "file-extension-icon-js";
import Box from "@mui/material/Box";
import SettingsBackupRestoreRoundedIcon from "@mui/icons-material/SettingsBackupRestoreRounded";
import Typography from "@mui/material/Typography";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import {Tooltip} from "@mui/material";

const sampleData = [
  "test.js",
  "launch.py",
  "config.json",
  ["directory", "python.py", "test.py", ["dir2", "config.yaml"]],
  ["dir3", "world.launch"],
];

export default function FileManager() {
  const Directory = props => {
    const [open, setOpen] = React.useState(true);
    return (
      <Box
        onClick={() => {
          setOpen(prev => !prev);
        }}
        display={"flex"}
        gap={"7px"}
        height={"40px"}
        width={"100%"}
        alignItems={"center"}
        sx={{
          "&:hover": {bgcolor: "background.cloverAppBar"},
          pl: "7px",
          pr: "7px",
          cursor: "pointer",
        }}>
        <ArrowForwardIosRoundedIcon
          sx={{
            color: "primary.50",
            width: "18px",
            transform: `rotate(${open ? "90deg" : "0deg"})`,
            transition: "transform 0.1s",
          }}
        />
        <img
          src={getMaterialFolderIcon("dir")}
          alt="directory"
          width="18px"
          height={"18px"}
        />
        <Typography
          color={"#b0b1b2"}
          sx={{
            fontSize: "14px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "70%",
          }}>
          {props.name}
        </Typography>
      </Box>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <Box display={"flex"} flexDirection={"column"}>
        <Box
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
          height={"50px"}
          pl={"10px"}
          pr={"10px"}>
          <Typography variant={"overline"} color={"#7c8186"}>
            workspace
          </Typography>
          <Tooltip title={"Revert instance to its initial state"}>
            <SettingsBackupRestoreRoundedIcon
              fontSize={"small"}
              sx={{
                color: "#7c8186",
                "&:hover": {color: "primary.50"},
                cursor: "pointer",
              }}
            />
          </Tooltip>
        </Box>
        <Directory name={"FILES"} />
      </Box>
    </ThemeProvider>
  );
}
