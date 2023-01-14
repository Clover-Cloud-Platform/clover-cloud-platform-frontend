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
import CreateNewFolderOutlinedIcon from "@mui/icons-material/CreateNewFolderOutlined";
import NoteAddOutlinedIcon from "@mui/icons-material/NoteAddOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";

const sampleData = [
  {
    type: "folder",
    name: "catkin_ws",
    children: [
      {
        type: "folder",
        name: "src",
        children: [
          {type: "file", name: "test.py"},
          {
            type: "folder",
            name: "clover",
            children: [{type: "file", name: "clover.world"}],
          },
        ],
      },
      {type: "file", name: "flight.py"},
    ],
  },
  {type: "file", name: "package.json"},
];

export default function FileManager() {
  const Directory = props => {
    const [open, setOpen] = React.useState(false);
    const [showActions, setShowActions] = React.useState("none");
    return (
      <>
        <Box
          onClick={() => {
            setOpen(prev => !prev);
          }}
          height={"30px"}
          width={"100%"}
          display={"flex"}
          justifyContent={"space-between"}
          onMouseOver={() => {
            setShowActions("flex");
          }}
          onMouseOut={() => {
            setShowActions("none");
          }}
          sx={{
            "&:hover": {bgcolor: "background.cloverAppBar"},
            pl: `${props.level * 10}px`,
            pr: "7px",
            cursor: "pointer",
          }}>
          <Box
            display={"flex"}
            gap={"7px"}
            alignItems={"center"}
            height={"30px"}>
            <ArrowForwardIosRoundedIcon
              sx={{
                color: "primary.50",
                width: "18px",
                transform: `rotate(${open ? "90deg" : "0deg"})`,
                transition: "transform 0.1s",
              }}
            />
            <img
              src={getMaterialFolderIcon(props.name)}
              alt={props.name}
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
          <Box
            gap={"4px"}
            alignItems={"center"}
            height={"30px"}
            display={showActions}
            mr={`${props.level * 10}px`}>
            <NoteAddOutlinedIcon
              sx={{
                fontSize: "18px",
                color: "rgba(176,177,178,0.5)",
                "&:hover": {color: "#b0b1b2"},
              }}
            />
            <CreateNewFolderOutlinedIcon
              sx={{
                fontSize: "18px",
                color: "rgba(176,177,178,0.5)",
                "&:hover": {color: "#b0b1b2"},
              }}
            />
            <EditOutlinedIcon
              sx={{
                fontSize: "18px",
                color: "rgba(176,177,178,0.5)",
                "&:hover": {color: "#b0b1b2"},
              }}
            />
            <DeleteOutlinedIcon
              sx={{
                fontSize: "18px",
                color: "rgba(176,177,178,0.5)",
                "&:hover": {color: "#b0b1b2"},
              }}
            />
          </Box>
        </Box>
        <Box display={open ? "visible" : "none"}>{props.children}</Box>
      </>
    );
  };

  const File = props => {
    return (
      <Box
        display={"flex"}
        gap={"7px"}
        height={"30px"}
        width={"100%"}
        alignItems={"center"}
        sx={{
          "&:hover": {bgcolor: "background.cloverAppBar"},
          pl: `${props.level * 10 + 25}px`,
          pr: "7px",
          cursor: "pointer",
        }}>
        <img
          src={getMaterialFileIcon(props.name)}
          alt={props.name}
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

  let level = 0;
  const FileTree = ({data}) => {
    level++;
    return data.map(item => {
      if (item.type === "file") {
        return <File name={item.name} level={level} key={item.name} />;
      }
      if (item.type === "folder") {
        return (
          <Directory name={item.name} level={level} key={item.name}>
            <FileTree data={item.children} />
          </Directory>
        );
      }
    });
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
        <FileTree data={sampleData} />
      </Box>
    </ThemeProvider>
  );
}
