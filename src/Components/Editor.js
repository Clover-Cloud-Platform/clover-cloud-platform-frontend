import * as React from "react";
import Editor from "@monaco-editor/react";
import Box from "@mui/material/Box";
import {workspaceTheme} from "./MainApp";
import {ThemeProvider} from "@mui/material/styles";
import {DndProvider, useDrop} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";
import {CircularProgress, Divider} from "@mui/material";
import {useHorizontalScroll} from "./HorizontalScroll";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import IconButton from "@mui/material/IconButton";

import {socket} from "./Instances";
import {useEffect} from "react";

export default function CodeEditor({
  files,
  language,
  value,
  instanceID,
  activeFile,
  changeSavedState,
  getActiveFile,
}) {
  const [localSavedState, setLocalSavedState] = React.useState(true);

  useEffect(() => {
    setLocalSavedState(true);
  }, [activeFile]);

  const FileView = props => {
    const [{canDrop, isOver}, drop] = useDrop(() => ({
      accept: "file",
      drop: () => ({name: "CodeEditor"}),
      collect: monitor => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }));

    const scrollRef = useHorizontalScroll();
    return (
      <>
        <Box
          ref={drop}
          height={"50px"}
          bgcolor={isOver && canDrop ? "#16161c" : "background.cloverMain"}>
          <Box
            mt={"4px"}
            height={"50px"}
            ref={scrollRef}
            sx={{
              overflowX: "scroll",
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": {
                display: "none",
              },
            }}
            display={"flex"}
            alignItems={"center"}>
            {props.files}
          </Box>
        </Box>
        <Divider sx={{bgcolor: "text.secondary"}} />
      </>
    );
  };

  const Preloader = () => {
    return (
      <Box
        display={"flex"}
        justifyContent={"center"}
        alignItems={"center"}
        bgcolor={"background.cloverMain"}
        height={"100%"}
        width={"100%"}>
        <CircularProgress />
      </Box>
    );
  };

  const editorMount = (editor, monaco) => {
    editor.addAction({
      id: "save-file-action-id",
      label: "Save",
      keybindings: [
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
        monaco.KeyMod.chord(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS),
      ],
      precondition: null,
      keybindingContext: null,
      contextMenuGroupId: "navigation",
      contextMenuOrder: 1.5,
      run: function (ed) {
        setLocalSavedState(true);
        socket.emit("WriteFile", {
          path: getActiveFile(),
          value: ed.getValue(),
          instanceID: instanceID,
        });
        changeSavedState(true);
      },
    });
  };

  return (
    <ThemeProvider theme={workspaceTheme}>
      <Box display={"flex"}>
        <Box
          sx={{flexGrow: 1}}
          style={{width: `calc(100% / 2)`}}
          bgcolor={"background.cloverMain"}>
          <DndProvider backend={HTML5Backend}>
            <FileView files={files} />
          </DndProvider>
        </Box>
        <Box
          display={"flex"}
          alignItems={"center"}
          justifyContent={"center"}
          overflow={"hidden"}
          width={language === "python" ? "50px" : "0px"}
          sx={{flexGrow: 0, transition: "width 0.3s"}}
          bgcolor={"background.cloverMain"}>
          <IconButton
            aria-label="run"
            color={"success"}
            onClick={() => {
              socket.emit("ExecuteCommand", {
                command: {
                  type: "command",
                  cmd: `python3 ~${activeFile}`,
                },
                instanceID: instanceID,
              });
            }}>
            <PlayArrowRoundedIcon />
          </IconButton>
        </Box>
      </Box>
      <Editor
        loading={<Preloader />}
        onMount={editorMount}
        onChange={() => {
          if (localSavedState) {
            changeSavedState(false, activeFile);
            console.log(1);
          }
          setLocalSavedState(false);
        }}
        theme={"vs-dark"}
        height="calc(100% - 50px)"
        value={value}
        language={language}
        options={{
          minimap: {
            enabled: false,
          },
          fontSize: 13,
          fontFamily:
            "Menlo, Cascadia Code, Consolas, Liberation Mono, monospace",
        }}
      />
    </ThemeProvider>
  );
}
