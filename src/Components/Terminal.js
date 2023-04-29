import * as React from "react";
import {useContext, useEffect} from "react";
import {
  Box,
  Divider,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import {ThemeProvider} from "@mui/material/styles";
import {theme} from "../App";
import {
  ContentCopyRounded,
  ContentCutRounded,
  ContentPasteRounded,
} from "@mui/icons-material";
import TerminalRoundedIcon from "@mui/icons-material/TerminalRounded";
import {socket} from "./Instances";
import {SettingsContext, TerminalHistoryContext} from "./Workspace";

let directorySet = false;

// Function that returns Terminal component
export default function Terminal(props) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [directory, setDirectory] = React.useState("");
  const open = Boolean(anchorEl);
  const {terminalBG} = useContext(SettingsContext);
  const {history, setHistory, historyKey, setHistoryKey} = useContext(
    TerminalHistoryContext,
  );

  // Function that executes entered command
  const execute = command => {
    const commandTrimmed = command.trim();
    if (commandTrimmed !== "") {
      // Push command to the history
      const newHistory = history;
      const prevSameCommand = newHistory.filter(
        item => item.command === commandTrimmed,
      );
      if (prevSameCommand.length > 0) {
        newHistory.splice(newHistory.indexOf(prevSameCommand[0]), 1);
      }
      newHistory.unshift({key: historyKey, command: commandTrimmed});
      setHistory(newHistory);

      // Check if the command is built-in
      if (commandTrimmed === "help") {
        document.getElementById(
          "output",
        ).innerHTML += `${commandTrimmed}\n  help -- display a list of built-in commands\n  clear -- clear console\n  open [file path] -- open file in the editor\n  use right-click or arrows ↑↓ to open context menu`;
      } else if (commandTrimmed === "clear") {
        document.getElementById("output").innerHTML = "";
      } else if (commandTrimmed.split(" ")[0] === "open") {
        const filePath = commandTrimmed.split(" ")[1];
        if (filePath[0] !== "/") {
          props.onOpen(
            `../../${directory.replace("~", "home/ubuntu")}/${filePath}`,
          );
        } else {
          props.onOpen(`../..${filePath}`);
        }
      } else {
        // Send command to the container
        socket.emit("ExecuteCommand", {
          command: {type: "command", cmd: commandTrimmed},
          instanceID: props.instanceID,
        });
      }
    }
  };

  useEffect(() => {
    const handleBeforeUnload = () => {
      // Stop the simulator when the user leaves the page
      socket.emit("StopGazebo", props.instanceID);
      if (history.length > 0) {
        // Kill all commands in terminal
        socket.emit("ExecuteCommand", {
          command: {
            type: "kill",
            cmd: history.map(command => (command = command.command)),
          },
          instanceID: props.instanceID,
        });
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (!directorySet) {
      // Get current directory
      socket.emit("ExecuteCommand", {
        command: {type: "command", cmd: "ls"},
        instanceID: props.instanceID,
      });
    }

    // Receive command output
    socket.on("CommandOutput", commandOutput => {
      if (document.getElementById("directory").value !== "$" && directorySet) {
        // Display output
        document.getElementById("output").innerHTML +=
          commandOutput.output.split("]0;")[0];
      }
      if (commandOutput.output.includes(props.instanceID)) {
        // Set directory
        setDirectory(
          commandOutput.output
            .split("$")[0]
            .split("</b>:<b>")[1]
            .split(">")[1]
            .split("<")[0],
        );
        if (!directorySet) {
          directorySet = true;
        }
      }
      setHistoryKey(prev => prev + 1);
    });
  }, []);

  // Handle enter, arrows and right click
  const handleKeyDown = e => {
    if (e.key === "Enter") {
      execute(e.currentTarget.value);
      e.currentTarget.value = "";
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      if (!anchorEl) {
        setAnchorEl(e.currentTarget);
      }
    }
  };
  const handleRightClick = e => {
    setAnchorEl(e.currentTarget);
    e.preventDefault();
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  // History item component
  const HistoryItem = props => {
    return (
      <MenuItem
        onClick={() => {
          handleClose();
          document.getElementById("terminal-input").value = props.command;
        }}>
        <ListItemIcon>
          <TerminalRoundedIcon fontSize="small" sx={{color: "primary.50"}} />
        </ListItemIcon>
        <ListItemText>{props.command}</ListItemText>
      </MenuItem>
    );
  };

  // Return the terminal component
  return (
    <ThemeProvider theme={theme}>
      <Box
        height={"100%"}
        bgcolor={terminalBG}
        sx={{
          overflowY: "scroll",
          scrollbarWidth: "thin",
          scrollbarColor: "#5f6368 #1c1b22",
          "&::-webkit-scrollbar": {
            width: "5px",
            height: "8px",
            backgroundColor: "#1c1b22",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#5f6368",
            borderRadius: "4px",
          },
        }}>
        <Box
          position={"fixed"}
          display={"flex"}
          color={"primary.50"}
          alignItems={"center"}
          width={"100%"}
          sx={{backdropFilter: "blur(5px)", bgcolor: "rgba(28,27,34,0.5)"}}>
          <Typography variant={"overline"} color={"#7c8186"} ml={"10px"}>
            Terminal
          </Typography>
          <Typography
            variant={"overline"}
            sx={{textDecoration: "underline", cursor: "pointer"}}
            color={"#7c8186"}
            ml={"10px"}
            onClick={() => {
              if (history.length > 0) {
                socket.emit("ExecuteCommand", {
                  command: {
                    type: "kill",
                    cmd: history.map(command => (command = command.command)),
                  },
                  instanceID: props.instanceID,
                });
              }
            }}>
            Kill current process
          </Typography>
        </Box>
        <Box display={"flex"} flexDirection={"column-reverse"}>
          <Box display={"flex"} mb={"10px"} alignItems={"center"}>
            <Typography
              ml={"2px"}
              id={"directory"}
              color={"text.dir"}
              fontFamily={"Monospace"}
              whiteSpace={"nowrap"}>
              {directory}$
            </Typography>
            <Menu
              anchorEl={anchorEl}
              id="account-menu"
              open={open}
              onClose={handleClose}
              onClick={handleClose}
              PaperProps={{
                elevation: 0,
                sx: {
                  filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                  backdropFilter: "blur(5px)",
                  bgcolor: "rgba(42,41,49,0.5)",
                  color: "primary.50",
                  fontFamily: "Monospace",
                  fontWeight: 400,
                  fontSize: "1rem",
                  lineHeight: 1.5,
                  letterSpacing: "0.00938em",
                  minWidth: "200px",
                  maxHeight: 300,
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
                },
              }}
              transformOrigin={{horizontal: "left", vertical: "top"}}
              anchorOrigin={{horizontal: "left", vertical: "bottom"}}>
              <MenuItem
                onClick={() => {
                  handleClose();
                  navigator.clipboard.writeText(
                    document.getElementById("terminal-input").value,
                  );
                  document.getElementById("terminal-input").value = "";
                }}>
                <ListItemIcon>
                  <ContentCutRounded
                    fontSize="small"
                    sx={{color: "primary.50"}}
                  />
                </ListItemIcon>
                <ListItemText>Cut</ListItemText>
                <Typography variant="body2" color="text.secondary">
                  CTRL+X
                </Typography>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleClose();
                  navigator.clipboard.writeText(
                    document.getElementById("terminal-input").value,
                  );
                }}>
                <ListItemIcon>
                  <ContentCopyRounded
                    fontSize="small"
                    sx={{color: "primary.50"}}
                  />
                </ListItemIcon>
                <ListItemText>Copy</ListItemText>
                <Typography variant="body2" color="text.secondary">
                  CTRL+C
                </Typography>
              </MenuItem>
              {navigator.userAgent.indexOf("Firefox") === -1 ? (
                <MenuItem
                  onClick={() => {
                    handleClose();
                    navigator.clipboard.readText().then(text => {
                      document.getElementById("terminal-input").value = text;
                    });
                  }}>
                  <ListItemIcon>
                    <ContentPasteRounded
                      fontSize="small"
                      sx={{color: "primary.50"}}
                    />
                  </ListItemIcon>
                  <ListItemText>Paste</ListItemText>
                  <Typography variant="body2" color="text.secondary">
                    CTRL+V
                  </Typography>
                </MenuItem>
              ) : null}
              <Divider />
              {history.map(el => (
                <HistoryItem key={el.key} command={el.command} />
              ))}
            </Menu>
            <input
              id={"terminal-input"}
              autoFocus
              onKeyDown={handleKeyDown}
              onContextMenu={handleRightClick}
              aria-controls={open ? "account-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
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
          <pre
            id={"output"}
            style={{
              color: theme.palette.primary["50"],
              fontFamily:
                "Menlo, Cascadia Code, Consolas, Liberation Mono, monospace",
              fontWeight: 400,
              fontSize: "0.9rem",
              lineHeight: 1.5,
              letterSpacing: "0.00938em",
              marginTop: "40px",
              marginLeft: "4px",
              marginRight: "4px",
            }}
          />
        </Box>
      </Box>
    </ThemeProvider>
  );
}
