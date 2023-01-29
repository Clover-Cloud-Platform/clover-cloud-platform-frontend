import * as React from "react";
import Editor from "@monaco-editor/react";
import Box from "@mui/material/Box";
import {workspaceTheme} from "./MainApp";
import {ThemeProvider} from "@mui/material/styles";
import {DndProvider, useDrag, useDrop} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";
import {Divider} from "@mui/material";
import {useHorizontalScroll} from "./HorizontalScroll";

export default function CodeEditor({files}) {
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
        <Box ref={drop} height={"50px"} bgcolor={"background.cloverMain"}>
          <Box
            height={"50px"}
            ref={scrollRef}
            sx={{
              overflowX: "scroll",
              scrollbarWidth: "none",
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

  return (
    <ThemeProvider theme={workspaceTheme}>
      <DndProvider backend={HTML5Backend}>
        <FileView files={files} />
      </DndProvider>
      <Editor
        theme={"vs-dark"}
        height="calc(100% - 50px)"
        defaultLanguage="python"
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
