import * as React from "react";
import Box from "@mui/material/Box";
import {getMaterialFileIcon} from "file-extension-icon-js";
import Typography from "@mui/material/Typography";
import {Divider} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import IconButton from "@mui/material/IconButton";
import {workspaceTheme} from "./Workspace";
import {ThemeProvider} from "@mui/material/styles";
import {useDrag, useDrop} from "react-dnd";
import CircleIcon from "@mui/icons-material/Circle";

export default function EditorFile(props) {
  const path = props.path;
  const [{canDrop, isOver}, drop] = useDrop(() => ({
    accept: ["file", "fileInEditor"],
    drop: () => ({name: path}),
    collect: monitor => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));
  const [{isDragging}, drag] = useDrag(() => ({
    item: {path},
    type: "fileInEditor",
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (item && dropResult) {
        if (item.path !== dropResult.name) {
          props.onMove(item.path, dropResult.name);
        }
      }
    },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
      handlerId: monitor.getHandlerId(),
    }),
  }));
  const [overActions, setOverActions] = React.useState(false);

  return (
    <ThemeProvider theme={workspaceTheme}>
      <Box
        display={"flex"}
        alignItems={"center"}
        position={"relative"}
        onClick={() => {
          if (!overActions) {
            props.onOpen(props.path);
          }
        }}
        ref={el => {
          drag(el);
          drop(el);
        }}
        sx={{
          height: "100%",
          cursor: "pointer",
          bgcolor:
            canDrop && isOver
              ? "background.cloverAppBar"
              : "background.cloverMain",
        }}>
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
            color={props.active ? "primary.50" : "text.secondary"}
            sx={{
              fontSize: "15px",
              overflow: "hidden",
            }}>
            {props.name}
          </Typography>
          <IconButton
            disabled={!props.saved}
            aria-label="close"
            size="small"
            sx={{ml: "4px", mr: "8px"}}
            onMouseOver={() => {
              setOverActions(true);
            }}
            onMouseOut={() => {
              setOverActions(false);
            }}
            onClick={() => {
              props.onDelete(props.path);
            }}>
            {props.saved ? (
              <CloseRoundedIcon sx={{fontSize: "1.2rem"}} />
            ) : (
              <CircleIcon sx={{fontSize: "0.6rem", p: "0.3rem"}} />
            )}
          </IconButton>
        </Box>
        <Box
          display={props.active ? "visible" : "none"}
          bgcolor={"primary.400"}
          height={"2px"}
          width={"100%"}
          sx={{position: "absolute", bottom: 0}}
        />
      </Box>
      <Divider orientation={"vertical"} sx={{bgcolor: "#33313f"}} />
    </ThemeProvider>
  );
}
