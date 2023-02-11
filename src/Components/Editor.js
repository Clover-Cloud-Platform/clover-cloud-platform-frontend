import * as React from "react";
import Editor from "@monaco-editor/react";
import Box from "@mui/material/Box";
import {workspaceTheme} from "./MainApp";
import {ThemeProvider} from "@mui/material/styles";
import {DndProvider, useDrag, useDrop} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";
import {Divider} from "@mui/material";
import {useHorizontalScroll} from "./HorizontalScroll";
import {io} from "socket.io-client";
import langMap from "language-map";

const socket = io(process.env.REACT_APP_SERVER_LINK);

export default function CodeEditor({files}) {
  const [editorValue, setEditorValue] = React.useState("");
  const [editorLang, setEditorLang] = React.useState("plaintext");
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
    return (
      <>
        <Box ref={drop} height={"50px"} bgcolor={"background.cloverMain"}>
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

  return (
    <ThemeProvider theme={workspaceTheme}>
      <DndProvider backend={HTML5Backend}>
        <FileView files={files} />
      </DndProvider>
      <Editor
        theme={"vs-dark"}
        height="calc(100% - 50px)"
        value={editorValue}
        language={editorLang}
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
