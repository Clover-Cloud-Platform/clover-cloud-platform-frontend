import * as React from "react";
import Editor from "@monaco-editor/react";
import Box from "@mui/material/Box";
import {workspaceTheme} from "./MainApp";
import {ThemeProvider} from "@mui/material/styles";
import {DndProvider, useDrag, useDrop} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";
import {CircularProgress, Divider} from "@mui/material";
import {useHorizontalScroll} from "./HorizontalScroll";
import {io} from "socket.io-client";
const socket = io(process.env.REACT_APP_SERVER_LINK);

export default function CodeEditor({files, language, value, instanceID}) {
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

  return (
    <ThemeProvider theme={workspaceTheme}>
      <DndProvider backend={HTML5Backend}>
        <FileView files={files} />
      </DndProvider>
      <Editor
        loading={<Preloader />}
        onChange={val => {
          socket.emit("WriteFile", {
            path: files.filter(el => el.props.active)[0].props.path,
            value: val,
            instanceID: instanceID,
          });
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
