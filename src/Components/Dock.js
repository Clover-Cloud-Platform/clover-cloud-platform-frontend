import * as React from "react";
import Box from "@mui/material/Box";
import {styled, ThemeProvider} from "@mui/material/styles";
import {Tooltip} from "@mui/material";
import files from "../assets/dock/files.svg";
import gazebo from "../assets/dock/gazebo.svg";
import vscode from "../assets/dock/vscode.svg";
import terminal from "../assets/dock/terminal.svg";
import {theme} from "../App";
export default function Dock() {
  const IconAppContainer = styled(Box)`
    ${({theme}) => `
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 5px;
    width: 50px;
    margin: 2px;
    transition: ${theme.transitions.create(["background-color"], {
      duration: theme.transitions.duration.standard,
    })};
    &:hover {
      background-color: #f5f3ff;
    }
  `}
  `;
  const IconApp = props => {
    return (
      <IconAppContainer onClick={props.onClick}>
        <Tooltip title={props.title}>
          <img
            src={props.src}
            width={props.width}
            alt={props.title}
            style={{cursor: "pointer"}}
          />
        </Tooltip>
      </IconAppContainer>
    );
  };
  return (
    <ThemeProvider theme={theme}>
      <Box
        position={"absolute"}
        ml={"auto"}
        mr={"auto"}
        left={0}
        right={0}
        bottom={"10px"}
        width={"200px"}
        display={"flex"}
        justifyContent={"space-between"}
        bgcolor={theme.palette.background.dock}
        pl={"30px"}
        pr={"30px"}
        borderRadius={"32px"}
        sx={{backdropFilter: "blur(10px)"}}>
        <IconApp src={files} width={42} title={"File Manager"} />
        <IconApp src={terminal} width={38} title={"Terminal"} />
        <IconApp src={vscode} width={33} title={"Code Editor"} />
        <IconApp src={gazebo} width={42} title={"Gazebo"} />
      </Box>
    </ThemeProvider>
  );
}
