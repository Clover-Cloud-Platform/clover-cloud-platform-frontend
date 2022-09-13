import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {ThemeProvider} from "@mui/material/styles";
import CircleIcon from "@mui/icons-material/Circle";
import Fade from "@mui/material/Fade";
import {Rnd} from "react-rnd";
import {Tooltip} from "@mui/material";
import {theme} from "../App";

let historyKey = 0;
let historyIndex = 0;
let down = false;
let up = false;
let history = [];

export default function Terminal(props) {
  const [output, setOutput] = React.useState([]);

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
    const moveCaretToEnd = () => {
      e.target.setSelectionRange(
        e.currentTarget.value.length,
        e.currentTarget.value.length,
      );
    };
    if (e.key === "Enter") {
      execute(e.currentTarget.value);
      history.unshift(e.currentTarget.value);
      historyKey++;
      historyIndex = 0;
      e.currentTarget.value = "";
    } else if (e.key === "ArrowUp") {
      if (historyIndex < historyKey) {
        if (down) {
          historyIndex++;
          down = false;
        }
        if (history[historyIndex]) {
          e.currentTarget.value = history[historyIndex];
        }
        moveCaretToEnd();
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
          e.currentTarget.value = history[historyIndex];
        }
        moveCaretToEnd();
      } else {
        down = false;
        up = false;
        historyIndex = 0;
        e.currentTarget.value = "";
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
      <Box
        sx={{
          position: "absolute",
          overflowY: "scroll",
          left: 10,
          right: 10,
          top: 25,
          bottom: 10,
        }}>
        <Box display={"flex"} flexDirection={"column-reverse"}>
          <Box display={"flex"}>
            <Typography color={theme.palette.text.dir} fontFamily={"Monospace"}>
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
    </ThemeProvider>
  );
}
