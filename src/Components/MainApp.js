import * as React from "react";

import {theme} from "../App";
import {createTheme, ThemeProvider} from "@mui/material/styles";

import ReactSplit, {SplitDirection} from "@devbookhq/splitter";

import Box from "@mui/material/Box";
import CodeEditor from "./Editor";
import "./MainApp.css";
import Terminal from "./Terminal";
import Gazebo from "./Gazebo";
import WorkspaceAppBar from "./WorkspaceAppBar";
import {useSearchParams} from "react-router-dom";
import FileManager from "./FileManager";
import EditorFile from "./EditorFile";

export const workspaceTheme = createTheme({
  palette: {
    mode: "dark",
    primary: theme.palette.primary,
    background: theme.palette.background,
    text: theme.palette.text,
    success: theme.palette.success,
    error: theme.palette.error,
    warning: theme.palette.warning,
  },
});

const filesBuffer = [];

export default function MainApp() {
  const [searchParams, setSearchParams] = useSearchParams();
  const instanceID = searchParams.get("id");

  const [editorFiles, setEditorFiles] = React.useState([]);

  let filesKey = 0;
  const dragToEditor = path => {
    let name = path.split("/");
    name = name[name.length - 1];
    let inEditor = false;
    for (const i in filesBuffer) {
      if (filesBuffer[i].props.path === path) {
        inEditor = true;
      }
      if (filesBuffer[i].props.name === name) {
        name = path.split("/");
        name = `${name.at(-2)}/${name.at(-1)}`;
      }
    }
    if (!inEditor) {
      filesBuffer.push(
        <EditorFile
          key={filesKey}
          name={name}
          path={path}
          onDelete={onDelete}
        />,
      );
      setEditorFiles(filesBuffer);
      filesKey++;
    }
  };

  const onDelete = path => {
    for (const i in filesBuffer) {
      if (filesBuffer[i].props.path === path) {
        filesBuffer.splice(i, 1);
        break;
      }
    }
    setEditorFiles([...filesBuffer]);
  };
  return (
    <ThemeProvider theme={workspaceTheme}>
      <Box width={"100%"} height={"100vh"}>
        <WorkspaceAppBar />
        <Box
          width={"100%"}
          style={{height: "calc(100% - 50px)"}}
          bgcolor={"background.cloverMain"}>
          <ReactSplit
            minWidths={[60, 60, 60]}
            initialSizes={[20, 45, 35]}
            direction={SplitDirection.Horizontal}
            draggerClassName={"dragger"}
            gutterClassName={"gutter-horizontal"}>
            <Box
              height={"100%"}
              bgcolor={"background.cloverMain"}
              sx={{
                overflowY: "scroll",
                overflowX: "hidden",
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": {
                  display: "none",
                },
              }}>
              <FileManager
                onDragToEditor={dragToEditor}
                instanceID={instanceID}
              />
            </Box>
            <Box height={"100%"} bgcolor={"#1e1e1e"}>
              <CodeEditor files={editorFiles} />
            </Box>
            <ReactSplit
              minHeights={[60, 60]}
              direction={SplitDirection.Vertical}
              draggerClassName={"dragger"}
              gutterClassName={"gutter-vertical"}>
              <Gazebo instanceID={instanceID} />
              <Terminal instanceID={instanceID} />
            </ReactSplit>
          </ReactSplit>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
