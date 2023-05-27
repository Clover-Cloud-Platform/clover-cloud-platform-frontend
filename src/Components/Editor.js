import * as React from "react";
import {useContext, useEffect, useRef} from "react";
import Editor from "@monaco-editor/react";
import Box from "@mui/material/Box";
import {
  SettingsContext,
  workspaceTheme,
  TerminalHistoryContext,
} from "./Workspace";
import {ThemeProvider} from "@mui/material/styles";
import {DndProvider, useDrop} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";
import {CircularProgress, Divider, Tooltip} from "@mui/material";
import {useHorizontalScroll} from "./HorizontalScroll";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import ArticleRoundedIcon from "@mui/icons-material/ArticleRounded";
import CodeRoundedIcon from "@mui/icons-material/CodeRounded";
import IconButton from "@mui/material/IconButton";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import {socket} from "./Instances";

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
  const {editorFontSize} = useContext(SettingsContext);
  const [mdViewMode, setMdViewMode] = React.useState(false);
  const {history, setHistory, historyKey} = useContext(TerminalHistoryContext);

  useEffect(() => {
    setLocalSavedState(true);
  }, [activeFile]);

  // Component that returns a list of files opened in the editor
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

  // Editor preloader
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

  const editorRef = useRef();
  const editorMount = (editor, monaco) => {
    // Add the Save action to the context menu
    editorRef.current = editor;
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
          width={
            language === "python" || language === "markdown" ? "50px" : "0px"
          }
          sx={{flexGrow: 0, transition: "width 0.3s"}}
          bgcolor={"background.cloverMain"}>
          {language === "python" ? (
            <Tooltip title={"Run script in Terminal"} disableInteractive>
              <IconButton
                aria-label="run"
                color={"success"}
                onClick={() => {
                  setLocalSavedState(true);
                  socket.emit("WriteFile", {
                    path: getActiveFile(),
                    value: editorRef.current.getValue(),
                    instanceID: instanceID,
                  });
                  changeSavedState(true);
                  // Push command to the history
                  const newHistory = history;
                  const prevSameCommand = newHistory.filter(
                    item =>
                      item.command === `python3 /home/ubuntu/${activeFile}`,
                  );
                  if (prevSameCommand.length > 0) {
                    newHistory.splice(
                      newHistory.indexOf(prevSameCommand[0]),
                      1,
                    );
                  }
                  newHistory.unshift({
                    key: historyKey,
                    command: `python3 /home/ubuntu/${activeFile}`,
                  });
                  setHistory(newHistory);
                  socket.emit("ExecuteCommand", {
                    command: {
                      type: "command",
                      cmd: `python3 /home/ubuntu/${activeFile}`,
                    },
                    instanceID: instanceID,
                  });
                }}>
                <PlayArrowRoundedIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip
              title={mdViewMode ? "Edit Markdown" : "Markdown reader"}
              disableInteractive>
              <IconButton
                aria-label={"view-md"}
                onClick={() => {
                  setMdViewMode(prev => !prev);
                }}>
                {mdViewMode ? <CodeRoundedIcon /> : <ArticleRoundedIcon />}
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
      <Box position={"relative"} id={"editor-container"}>
        <Editor
          loading={<Preloader />}
          onMount={editorMount}
          onChange={() => {
            setMdViewMode(false);
            if (localSavedState) {
              changeSavedState(false, activeFile);
              setLocalSavedState(false);
            }
          }}
          theme={"vs-dark"}
          height="100%"
          value={value}
          language={language}
          options={{
            minimap: {
              enabled: false,
            },
            fontSize: editorFontSize,
            fontFamily:
              "Menlo, Cascadia Code, Consolas, Liberation Mono, monospace",
          }}
        />
        {mdViewMode ? (
          <Box
            color={"primary.50"}
            bgcolor={"background.cloverMain"}
            position={"absolute"}
            height={"100%"}
            width={"100%"}
            sx={{
              overflow: "scroll",
              scrollbarWidth: "thin",
              scrollbarColor: "#5f6368 #2a2931",
              "&::-webkit-scrollbar": {
                width: "5px",
                height: "8px",
                backgroundColor: "#2a2931",
                borderRadius: "4px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#5f6368",
                borderRadius: "4px",
              },
            }}
            top={0}
            left={0}>
            <ReactMarkdown
              children={editorRef.current.getValue()}
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
            />
          </Box>
        ) : (
          <></>
        )}
      </Box>
    </ThemeProvider>
  );
}
