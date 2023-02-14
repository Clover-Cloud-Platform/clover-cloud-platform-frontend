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
import {io} from "socket.io-client";
import langMap from "language-map";
const socket = io(process.env.REACT_APP_SERVER_LINK);

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
  const [editorValue, setEditorValue] = React.useState("");
  const [editorLang, setEditorLang] = React.useState("plaintext");

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
          onOpen={onOpen}
          onMove={onMove}
          active={true}
        />,
      );
      onOpen(path);
      filesKey++;
    }
  };

  const onDelete = path => {
    for (const i in filesBuffer) {
      if (filesBuffer[i].props.path === path) {
        if (
          filesBuffer[i].props.active &&
          (filesBuffer[i - 1] || filesBuffer.length > 1)
        ) {
          setTimeout(() => {
            if (filesBuffer[i - 1]) {
              onOpen(filesBuffer[i - 1].props.path);
            } else {
              onOpen(filesBuffer[i].props.path);
            }
          }, 1);
        }
        filesBuffer.splice(i, 1);
        setEditorFiles([...filesBuffer]);
        break;
      }
    }
  };

  const onOpen = path => {
    for (const i in filesBuffer) {
      if (filesBuffer[i].props.path === path) {
        if (!filesBuffer[i].props.active) {
          filesBuffer[i] = (
            <EditorFile
              key={filesBuffer[i].key}
              name={filesBuffer[i].props.name}
              path={filesBuffer[i].props.path}
              onDelete={onDelete}
              onOpen={onOpen}
              onMove={onMove}
              active={true}
            />
          );
        }
      } else {
        if (filesBuffer[i].props.active) {
          filesBuffer[i] = (
            <EditorFile
              key={filesBuffer[i].key}
              name={filesBuffer[i].props.name}
              path={filesBuffer[i].props.path}
              onDelete={onDelete}
              onOpen={onOpen}
              onMove={onMove}
              active={false}
            />
          );
        }
      }
    }
    setEditorFiles([...filesBuffer]);
    console.log("get content", path);
    socket.emit("GetFileContent", {path: path, instanceID: instanceID});
    socket.on("FileContent", file => {
      setEditorValue(file.content);
      let lang = Object.entries(langMap).filter(
        lang =>
          lang[1].extensions &&
          lang[1].extensions.includes(`.${file.path.split(".").at(-1)}`),
      )[0][1].aceMode;
      if (lang.includes("_")) {
        lang = lang.split("_")[1];
      }
      setEditorLang(lang);
    });
  };

  const onMove = (source, target) => {
    const src = filesBuffer.indexOf(
      filesBuffer.filter(file => file.props.path === source)[0],
    );
    const tgt = filesBuffer.indexOf(
      filesBuffer.filter(file => file.props.path === target)[0],
    );
    const tgtCopy = filesBuffer[tgt];
    filesBuffer[tgt] = filesBuffer[src];
    filesBuffer[src] = tgtCopy;
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
              <CodeEditor
                files={editorFiles}
                language={editorLang}
                value={editorValue}
              />
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
