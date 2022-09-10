import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {createTheme, ThemeProvider} from "@mui/material/styles";
import wallpaper from "../assets/wallpaper.jpg";
import CircleIcon from "@mui/icons-material/Circle";
import Fade from "@mui/material/Fade";
import {Rnd} from "react-rnd";
import {Tooltip} from "@mui/material";

let historyKey = 0;
let historyIndex = 0;
let down = false;
let up = false;
let history = [];
let fullScreenMode = false;
let prevTermPosition = false;
let prevTermSize = false;

export default function Terminal() {
  const theme = createTheme({
    palette: {
      primary: {
        50: "#f5f3ff",
        100: "#ede9fe",
        200: "#ddd6fe",
        300: "#c4b5fd",
        400: "#a78bfa",
        500: "#8b5cf6",
        600: "#7c3aed",
        700: "#6d28d9",
        800: "#5b21b6",
        900: "#4c1d95",
      },
      background: {
        default: "rgba(33,29,42,0.9)",
      },
      text: {
        primary: "#fff",
        dir: "#a78bfa",
        execDir: "#8b5cf6",
      },
    },
  });

  const [output, setOutput] = React.useState([]);
  const [draggable, disableDraggable] = React.useState(false);
  const [minimized, setMinimized] = React.useState(true);
  const [size, setSize] = React.useState({width: 700, height: 400});
  const [position, setPosition] = React.useState({
    x: window.innerWidth / 2 - 350,
    y: window.innerHeight / 2 - 200,
  });

  const execute = command => {
    if (command.trim() !== "") {
      switch (command) {
        case "help":
          setOutput([
            <OutputElement key={historyKey}>
              {`${command}\n  help  -- display a list of commands\n  clear -- clear console`}
            </OutputElement>,
            ...output,
          ]);
          break;
        case "clear":
          setOutput([]);
          historyIndex = 0;
          break;
        default:
          setOutput([
            <OutputElement key={historyKey} error>
              {`${command}: Command not found`}
            </OutputElement>,
            ...output,
          ]);
      }
    }
  };

  const handleKeyDown = e => {
    let input = document.getElementById("terminalInput");
    if (e.key === "Enter") {
      execute(input.value);
      history.unshift(input.value);
      historyKey++;
      historyIndex = 0;
      input.value = "";
    } else if (e.key === "ArrowUp") {
      if (historyIndex < historyKey) {
        if (down) {
          historyIndex++;
          down = false;
        }
        if (history[historyIndex]) {
          input.value = history[historyIndex];
        }
        setTimeout(() => {
          input.selectionStart = input.selectionEnd = input.value.length;
        }, 1);
        historyIndex++;
        up = true;
      }
    } else if (e.key === "ArrowDown") {
      if (historyIndex > 0) {
        if (!up) {
          historyIndex--;
        } else {
          historyIndex -= 2;
          up = false;
        }
        down = true;
        if (history[historyIndex]) {
          input.value = history[historyIndex];
        }
        setTimeout(() => {
          input.selectionStart = input.selectionEnd = input.value.length;
        }, 1);
      } else {
        down = false;
        up = false;
        historyIndex = 0;
        input.value = "";
      }
    }
  };

  const OutputElement = props => {
    let color = theme.palette.text.primary;
    if (props.error) {
      color = theme.palette.error.main;
    }
    return (
      <Box width={"100%"} color={theme.palette.text.primary} display={"flex"}>
        <Typography color={theme.palette.text.execDir} fontFamily={"Monospace"}>
          ~$
        </Typography>
        <Typography
          color={color}
          sx={{wordWrap: "break-word", whiteSpace: "pre-wrap"}}
          fontFamily={"Monospace"}
          ml={"4px"}>
          {props.children}
        </Typography>
      </Box>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <Rnd
        enableResizing={!draggable}
        disableDragging={draggable}
        minHeight={200}
        minWidth={250}
        size={size}
        position={position}
        onDragStop={(e, d) => {
          setPosition({x: d.x, y: d.y});
          prevTermPosition = {x: d.x, y: d.y};
        }}
        onResizeStop={(e, direction, ref, delta, position) => {
          setSize({
            width: ref.style.width,
            height: ref.style.height,
          });
          prevTermSize = {width: ref.style.width, height: ref.style.height};
          prevTermPosition = position;
          setPosition(position);
        }}
        resizeHandleStyles={{
          left: {cursor: "e-resize"},
          right: {cursor: "ew-resize"},
          top: {cursor: "s-resize"},
          bottom: {cursor: "s-resize"},
        }}>
        <Fade in={minimized}>
          <Box
            sx={{cursor: "auto"}}
            bgcolor={theme.palette.background.default}
            boxShadow={"4px 4px 26px 1px rgba(0, 0, 0, 0.47)"}
            borderRadius={"18px"}
            position={"absolute"}
            m={"auto"}
            left={0}
            right={0}
            top={0}
            bottom={0}>
            <Box mb={"10px"} ml={"14px"} mr={"14px"}>
              <Box position={"absolute"} top={0} right={0} display={"flex"}>
                <Box
                  m={"1px"}
                  p={"5px"}
                  onClick={() => {
                    setMinimized(prev => !prev);
                  }}>
                  <Tooltip title={"Minimize"}>
                    <CircleIcon
                      sx={{
                        fontSize: 17,
                        color: theme.palette.success.light,
                        ":hover": {color: theme.palette.success.dark},
                      }}
                    />
                  </Tooltip>
                </Box>
                <Box
                  m={"1px"}
                  p={"5px"}
                  onClick={() => {
                    if (!fullScreenMode) {
                      fullScreenMode = true;
                      setPosition({
                        x: 0,
                        y: 0,
                      });
                      setSize({width: "100%", height: "100%"});
                      disableDraggable(true);
                    } else {
                      setSize(prevTermSize);
                      setPosition(prevTermPosition);
                      fullScreenMode = false;
                      disableDraggable(false);
                    }
                  }}>
                  <Tooltip
                    title={fullScreenMode ? "Window Mode" : "Fullscreen Mode"}>
                    <CircleIcon
                      sx={{
                        fontSize: 17,
                        color: theme.palette.warning.light,
                        ":hover": {color: theme.palette.warning.dark},
                      }}
                    />
                  </Tooltip>
                </Box>
                <Box
                  m={"1px"}
                  p={"5px"}
                  onClick={() => {
                    setMinimized(prev => !prev);
                  }}>
                  <Tooltip title={"Close"}>
                    <CircleIcon
                      sx={{
                        fontSize: 17,
                        color: theme.palette.error.light,
                        ":hover": {color: theme.palette.error.dark},
                      }}
                    />
                  </Tooltip>
                </Box>
              </Box>
              <Box
                sx={{
                  position: "absolute",
                  overflowY: "scroll",
                  left: 10,
                  right: 10,
                  top: 25,
                  bottom: 10,
                }}>
                <Box
                  display={"flex"}
                  flexDirection={"column-reverse"}
                  onMouseOut={() => {
                    if (!fullScreenMode) {
                      disableDraggable(false);
                    }
                  }}
                  onMouseOver={() => {
                    disableDraggable(true);
                  }}>
                  <Box display={"flex"}>
                    <Typography
                      color={theme.palette.text.dir}
                      fontFamily={"Monospace"}>
                      ~$
                    </Typography>
                    <input
                      id={"terminalInput"}
                      autoFocus
                      onKeyDown={handleKeyDown}
                      style={{
                        background: "transparent",
                        width: "100%",
                        outline: "none",
                        border: "none",
                        color: theme.palette.text.primary,
                        fontFamily: "Monospace",
                        fontWeight: 400,
                        fontSize: "1rem",
                        lineHeight: 1.5,
                        letterSpacing: "0.00938em",
                      }}
                    />
                  </Box>
                  {output}
                </Box>
              </Box>
            </Box>
          </Box>
        </Fade>
      </Rnd>
    </ThemeProvider>
  );
}
