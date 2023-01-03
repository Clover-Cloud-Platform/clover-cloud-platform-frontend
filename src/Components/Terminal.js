import * as React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {ThemeProvider} from "@mui/material/styles";
import {theme} from "../App";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import {Divider, ListItemIcon, ListItemText} from "@mui/material";
import {ContentCopy, ContentCut, ContentPaste} from "@mui/icons-material";
import TerminalRoundedIcon from "@mui/icons-material/TerminalRounded";
import {io} from "socket.io-client";

const socket = io(process.env.REACT_APP_SERVER_LINK);

export default function Terminal(props) {
  const [output, setOutput] = React.useState([]);
  const [history, setHistory] = React.useState([]);
  const [historyKey, setHistoryKey] = React.useState(0);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

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

  const execute = command => {
    const commandTrimmed = command.trim();
    if (commandTrimmed !== "") {
      const newHistory = history;
      const prevSameCommand = newHistory.filter(
        item => item.props.command === commandTrimmed,
      );
      if (prevSameCommand.length > 0) {
        newHistory.splice(newHistory.indexOf(prevSameCommand[0]), 1);
      }
      newHistory.unshift(
        <HistoryItem key={historyKey} command={commandTrimmed} />,
      );
      setHistory(newHistory);
      setHistoryKey(prev => prev + 1);
      switch (commandTrimmed) {
        case "help":
          setOutput([
            <OutputElement key={historyKey}>
              {`${commandTrimmed}\n  help  -- display a list of commands\n  clear -- clear console\n  use right-click or arrows ↑↓ to open context menu`}
            </OutputElement>,
            ...output,
          ]);
          break;
        case "clear":
          setOutput([]);
          break;
        default:
          socket.emit("ExecuteCommand", {
            command: commandTrimmed,
            instanceID: props.instanceID,
          });
          socket.on("CommandOutput", commandOutput => {
            setOutput([
              <OutputElement key={historyKey} error={commandOutput.error}>
                {commandOutput.output}
              </OutputElement>,
              ...output,
            ]);
          });
      }
    }
  };

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

  const OutputElement = props => {
    let color = theme.palette.primary["50"];
    if (props.error) {
      color = theme.palette.error.main;
    }
    return (
      <Box width={"100%"} color={"text.primary"} display={"flex"}>
        <Typography color={"text.dir"} fontFamily={"Monospace"}>
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
    setAnchorEl(e.currentTarget);
    e.preventDefault();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        height={"100%"}
        bgcolor={"background.cloverMain"}
        p={"5px"}
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
        <Box display={"flex"} flexDirection={"column-reverse"}>
          <Box display={"flex"}>
            <Typography color={"text.dir"} fontFamily={"Monospace"}>
              ~$
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
                  <ContentCut fontSize="small" sx={{color: "primary.50"}} />
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
                  <ContentCopy fontSize="small" sx={{color: "primary.50"}} />
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
                    <ContentPaste fontSize="small" sx={{color: "primary.50"}} />
                  </ListItemIcon>
                  <ListItemText>Paste</ListItemText>
                  <Typography variant="body2" color="text.secondary">
                    CTRL+V
                  </Typography>
                </MenuItem>
              ) : null}
              <Divider />
              {history}
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
          {output}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
