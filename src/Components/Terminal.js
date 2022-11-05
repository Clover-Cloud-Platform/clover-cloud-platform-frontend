import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {ThemeProvider} from "@mui/material/styles";
import {theme} from "../App";

export default function Terminal(props) {
  const [output, setOutput] = React.useState([]);
  const [history, setHistory] = React.useState([]);
  const [historyKey, setHistoryKey] = React.useState(0);

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
    if (e.key === "Enter") {
      execute(e.currentTarget.value);
      setHistory([e.currentTarget.value, ...history]);
      setHistoryKey(prev => prev + 1);
      e.currentTarget.value = "";
    }
  };

  const OutputElement = props => {
    let color = theme.palette.primary["50"];
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

  const handleRightClick = e => {
    console.log("a");
    //TODO: create context menu with copy/paste functions and commands from history
    e.preventDefault();
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        height={"100%"}
        bgcolor={"#202327"}
        p={"5px"}
        sx={{
          overflowY: "scroll",
        }}>
        <Box display={"flex"} flexDirection={"column-reverse"}>
          <Box display={"flex"}>
            <Typography color={theme.palette.text.dir} fontFamily={"Monospace"}>
              ~$
            </Typography>
            <input
              id={`terminalInput${props.instanceIndex}`}
              autoFocus
              onKeyDown={handleKeyDown}
              onContextMenu={handleRightClick}
              style={{
                background: "transparent",
                width: "100%",
                outline: "none",
                border: "none",
                color: theme.palette.primary["50"],
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
