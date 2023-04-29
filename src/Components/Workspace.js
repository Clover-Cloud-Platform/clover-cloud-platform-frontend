import * as React from "react";
import {useEffect} from "react";
import {theme} from "../App";
import {createTheme, ThemeProvider} from "@mui/material/styles";
import ReactSplit, {SplitDirection} from "@devbookhq/splitter";
import {Box, CircularProgress, Typography} from "@mui/material";
import CodeEditor from "./Editor";
import "./Workspace.css";
import Terminal from "./Terminal";
import Gazebo from "./Gazebo";
import WorkspaceAppBar from "./WorkspaceAppBar";
import {useSearchParams} from "react-router-dom";
import FileManager from "./FileManager";
import EditorFile from "./EditorFile";
import langMap from "language-map";
import {DndProvider, useDrop} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";
import {socket} from "./Instances";
import {ReactComponent as Logo} from "../assets/clover-cloud-platform-logo.svg";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import Button from "@mui/material/Button";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

// Define new theme
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
let activeFileGlobal = "";

// Global settings state
export const SettingsContext = React.createContext(null);
// Global instance error page state
export const InstanceErrorContext = React.createContext(null);
// Global terminal history state
export const TerminalHistoryContext = React.createContext(null);

// Function that renders the workspace component
export default function Workspace() {
  const [searchParams, setSearchParams] = useSearchParams();
  const instanceID = searchParams.get("id");
  const [editorFiles, setEditorFiles] = React.useState([]);
  const [editorValue, setEditorValue] = React.useState("");
  const [editorLang, setEditorLang] = React.useState("plaintext");
  const [openEditor, setOpenEditor] = React.useState(false);
  const [activeFile, setActiveFile] = React.useState("");
  const [preloaderOpacity, setPreloaderOpacity] = React.useState(1);
  const [preloader, setPreloader] = React.useState(true);
  const [splitSizesX, setSplitSizesX] = React.useState([20, 45, 35]);
  const [splitSizesY, setSplitSizesY] = React.useState([50, 50]);
  const [terminalBG, setTerminalBG] = React.useState("#1c1b22");
  const [editorFontSize, setEditorFontSize] = React.useState(13);
  const [instanceError, setInstanceError] = React.useState(null);
  const [history, setHistory] = React.useState([]);
  const [historyKey, setHistoryKey] = React.useState(0);

  useEffect(() => {
    // Change theme color
    document
      .querySelector('meta[name="theme-color"]')
      .setAttribute("content", "#2a2931");

    // Apply settings
    if (localStorage.getItem("config")) {
      setTerminalBG(JSON.parse(localStorage.getItem("config")).terminalBG);
      setEditorFontSize(
        JSON.parse(localStorage.getItem("config")).editorFontSize,
      );
    } else if (sessionStorage.getItem("config")) {
      setTerminalBG(JSON.parse(sessionStorage.getItem("config")).terminalBG);
      setEditorFontSize(
        JSON.parse(sessionStorage.getItem("config")).editorFontSize,
      );
    }
  }, []);

  // Editor start window where you can drop files
  const EditorStartWindow = () => {
    const [{canDrop, isOver}, drop] = useDrop(() => ({
      accept: "file",
      drop: () => ({name: "CodeEditor"}),
      collect: monitor => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }));

    return (
      <Box
        ref={drop}
        bgcolor={isOver && canDrop ? "#16161c" : "background.cloverMain"}
        height={"100%"}
        display={"flex"}
        alignItems={"center"}
        justifyContent={"center"}>
        <Typography variant={"overline"} color={"#7c8186"}>
          drop a file here to edit it
        </Typography>
      </Box>
    );
  };

  // A function that moves a file to the editor
  const dragToEditor = path => {
    if (!openEditor) {
      setOpenEditor(true);
    }
    let name = path.split("/");
    name = name[name.length - 1];
    let inEditor = false;
    for (const i in filesBuffer) {
      if (filesBuffer[i].props.path === path) {
        inEditor = true;
        break;
      }
      if (filesBuffer[i].props.name === name) {
        name = path.split("/");
        name = `${name.at(-2)}/${name.at(-1)}`;
      }
    }
    if (!inEditor) {
      filesBuffer.push(
        <EditorFile
          key={path}
          name={name}
          path={path}
          onDelete={onDelete}
          onOpen={onOpen}
          onMove={onMove}
          active={true}
          saved={true}
        />,
      );
      onOpen(path);
    } else {
      onOpen(path);
    }
  };

  // A function that closes a file in the editor
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
        if (filesBuffer.length === 0) {
          setEditorValue("");
          setOpenEditor(false);
        }
        setEditorFiles([...filesBuffer]);
        break;
      }
    }
  };

  // A function that opens a file in the editor
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
              saved={filesBuffer[i].props.saved}
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
              saved={filesBuffer[i].props.saved}
            />
          );
        }
      }
    }
    setEditorFiles([...filesBuffer]);
    // Get file content
    socket.emit("GetFileContent", {path: path, instanceID: instanceID});
    // Receive content
    socket.on("FileContent", file => {
      // Set value
      setEditorValue(file.content);
      // Set language for the editor
      let lang;
      let langList;
      if (!file.path.split("/").at(-1).includes(".")) {
        lang = "plaintext";
      } else {
        langList = Object.entries(langMap).filter(
          lang =>
            lang[1].extensions &&
            lang[1].extensions.includes(`.${file.path.split(".").at(-1)}`),
        );
        let extNum = 0;
        let extIndex = 0;
        for (let i in langList) {
          if (langList[i][1].extensions.length > extNum) {
            extNum = langList[i][1].extensions.length;
            extIndex = i;
          }
        }
        lang = langList[extIndex][1].aceMode;
        if (lang.includes("_")) {
          lang = lang.split("_")[1];
        }
        if (lang === "text") {
          lang = "plaintext";
        }
      }
      setEditorLang(lang);
      setActiveFile(file.path);
      activeFileGlobal = file.path;
    });
  };

  // A function that allows users to move files in the editor
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

  // A function that changes saved/unsaved state of the file
  const changeSavedState = (save, actFile = activeFileGlobal) => {
    if (actFile === activeFileGlobal) {
      for (const i in filesBuffer) {
        if (filesBuffer[i].props.path === activeFileGlobal) {
          filesBuffer[i] = (
            <EditorFile
              key={filesBuffer[i].key}
              name={filesBuffer[i].props.name}
              path={filesBuffer[i].props.path}
              onDelete={onDelete}
              onOpen={onOpen}
              onMove={onMove}
              active={filesBuffer[i].props.active}
              saved={save}
            />
          );
        }
      }
      setEditorFiles([...filesBuffer]);
    }
  };

  const getActiveFile = () => {
    return activeFileGlobal;
  };

  // Hide preloader
  const hidePreloader = () => {
    setPreloaderOpacity(0);
    setTimeout(() => {
      setPreloader(false);
    }, 225);
  };

  // Return the workspace component
  return (
    <div style={{backgroundColor: "#1c1b22"}}>
      <ThemeProvider theme={workspaceTheme}>
        <SettingsContext.Provider
          value={{
            terminalBG: terminalBG,
            setTerminalBG: setTerminalBG,
            editorFontSize: editorFontSize,
            setEditorFontSize: setEditorFontSize,
          }}>
          <InstanceErrorContext.Provider
            value={{
              instanceError: instanceError,
              setInstanceError: setInstanceError,
            }}>
            <TerminalHistoryContext.Provider
              value={{
                history: history,
                setHistory: setHistory,
                historyKey: historyKey,
                setHistoryKey: setHistoryKey,
              }}>
              {preloader ? (
                <Box
                  style={{
                    transition:
                      "opacity 225ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
                    opacity: preloaderOpacity,
                  }}
                  position={"fixed"}
                  height={"100vh"}
                  zIndex={99999}
                  bgcolor={"background.cloverMain"}
                  width={"100%"}
                  display={"flex"}
                  justifyContent={"center"}
                  alignItems={"center"}>
                  <CircularProgress size={"60px"} sx={{position: "absolute"}} />
                  <Logo width={"40px"} />
                </Box>
              ) : (
                <></>
              )}
              {instanceError ? (
                <Box
                  width={"100%"}
                  height={"100vh"}
                  display={"flex"}
                  alignItems={"center"}
                  justifyContent={"center"}
                  flexDirection={"column"}
                  gap={"20px"}>
                  <ErrorOutlineRoundedIcon color={"error"} fontSize={"large"} />
                  <Typography
                    sx={{
                      color: "primary.50",
                      fontFamily: "Google Sans,Noto Sans,sans-serif",
                      letterSpacing: "-.5px",
                      lineHeight: "1.2em",
                      fontSize: "24px",
                      "@media (min-width:900px)": {fontSize: "30px"},
                      textAlign: "center",
                      mb: "30px",
                    }}>
                    {instanceError === 1
                      ? "This instance is stopped. Go to the Dashboard to run it."
                      : "This instance does not exist, or you do not have access to it."}
                  </Typography>
                  <Button
                    href={"/instances"}
                    variant={"outlined"}
                    startIcon={<ArrowBackRoundedIcon />}>
                    Go to dashboard
                  </Button>
                </Box>
              ) : (
                <Box width={"100%"} height={"100vh"}>
                  <WorkspaceAppBar hidePreloader={hidePreloader} />
                  <Box
                    width={"100%"}
                    style={{height: "calc(100% - 50px)"}}
                    bgcolor={"background.cloverMain"}>
                    <ReactSplit
                      minWidths={[160, 200, 320]}
                      initialSizes={splitSizesX}
                      direction={SplitDirection.Horizontal}
                      draggerClassName={"dragger"}
                      gutterClassName={"gutter-horizontal"}
                      onResizeFinished={(pairIdx, newSizes) => {
                        setSplitSizesX(newSizes);
                      }}>
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
                          onLoadManager={hidePreloader}
                        />
                      </Box>
                      <Box height={"100%"} bgcolor={"#1e1e1e"}>
                        {openEditor ? (
                          <CodeEditor
                            files={editorFiles}
                            activeFile={activeFile}
                            language={editorLang}
                            value={editorValue}
                            instanceID={instanceID}
                            changeSavedState={changeSavedState}
                            getActiveFile={getActiveFile}
                          />
                        ) : (
                          <DndProvider backend={HTML5Backend}>
                            <EditorStartWindow />
                          </DndProvider>
                        )}
                      </Box>
                      <ReactSplit
                        minHeights={[300, 150]}
                        initialSizes={splitSizesY}
                        onResizeFinished={(pairIdx, newSizes) => {
                          setSplitSizesY(newSizes);
                        }}
                        direction={SplitDirection.Vertical}
                        draggerClassName={"dragger"}
                        gutterClassName={"gutter-vertical"}>
                        <Gazebo instanceID={instanceID} />
                        <Terminal
                          instanceID={instanceID}
                          onOpen={dragToEditor}
                        />
                      </ReactSplit>
                    </ReactSplit>
                  </Box>
                </Box>
              )}
            </TerminalHistoryContext.Provider>
          </InstanceErrorContext.Provider>
        </SettingsContext.Provider>
      </ThemeProvider>
    </div>
  );
}
