import * as React from "react";
import {useContext} from "react";
import {SettingsContext, workspaceTheme} from "./Workspace";
import {ThemeProvider} from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Menu,
  MenuItem,
  TextField,
  Tooltip,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import ExitToAppRoundedIcon from "@mui/icons-material/ExitToAppRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import {socket} from "./Instances";
import {useSearchParams} from "react-router-dom";
import {StyledPaper} from "./GenerateArucoDialog";
import {TwitterPicker} from "react-color";

let instanceDataReceived = false;

// A component that returns app bar for workspace
export default function WorkspaceAppBar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [instanceName, setInstanceName] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [openSettings, setOpenSettings] = React.useState(false);

  // Get settings
  const {terminalBG, setTerminalBG} = useContext(SettingsContext);
  const {editorFontSize, setEditorFontSize} = useContext(SettingsContext);

  // Get instance id and uid
  const instanceID = searchParams.get("id");
  if (!instanceID) {
    window.location.href = "/instances";
  }
  let uid;
  if (localStorage.getItem("uid")) {
    uid = localStorage.getItem("uid");
  } else if (sessionStorage.getItem("uid")) {
    uid = sessionStorage.getItem("uid");
  } else {
    window.location.href = "/signin";
  }

  // Get instance data - container state, user name, and instance name
  socket.emit("GetInstanceData", {uid: uid, instance_id: instanceID});
  socket.on("InstanceData", data => {
    if (!instanceDataReceived) {
      if (data.instance_state) {
        if (data.instance_state === "Running") {
          console.log(1);
        } else if (data.instance_state === "Stopped") {
          console.log(2);
        } else if (data.instance_state === "No access") {
          console.log(3);
        }
      }
      setUsername(data.username);
      setInstanceName(data.instance_name);
      instanceDataReceived = true;
    }
  });

  // Handle user menu events
  const handleOpenUserMenu = event => {
    setAnchorElUser(event.currentTarget);
  };
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  // A component for editing workspace settings
  const Settings = () => {
    const [tColor, setTColor] = React.useState(terminalBG);
    const [fontSize, setFontSize] = React.useState(editorFontSize);

    // A function that saves settings to the global state and local/session storage
    const saveSettings = e => {
      e.preventDefault();
      setOpenSettings(false);
      setTerminalBG(tColor);
      setEditorFontSize(fontSize);
      const config = JSON.stringify({
        editorFontSize: fontSize,
        terminalBG: tColor,
      });
      if (localStorage.getItem("uid")) {
        localStorage.setItem("config", config);
      } else if (sessionStorage.getItem("uid")) {
        sessionStorage.setItem("config", config);
      } else {
        window.location.href = "/signin";
      }
    };

    // Return the settings component
    return (
      <Dialog
        fullWidth
        maxWidth={"sm"}
        PaperComponent={StyledPaper}
        open={openSettings}
        onClose={() => {
          setOpenSettings(false);
        }}
        aria-labelledby="settings-dialog-title"
        aria-describedby="settings-dialog-description">
        <DialogTitle id="settings-dialog-title" color={"primary.50"}>
          {"Settings"}
        </DialogTitle>
        <DialogContent>
          <Typography color={"primary.50"} mb={"10px"}>
            Terminal background color
          </Typography>
          <Box ml={"15px"}>
            <TwitterPicker
              onChange={color => {
                setTColor(color.hex);
              }}
              triangle={"hide"}
              color={tColor}
              colors={[
                "#1c1b22",
                "#000000",
                "#0f111a",
                "#2a2931",
                "#35363a",
                "#012456",
                "#003f26",
                "#b3faff",
                "#8e9ba5",
                "#f5f3ff",
              ]}
            />
          </Box>
          <Typography color={"primary.50"} mt={"15px"}>
            Editor font size
          </Typography>
          <TextField
            value={fontSize}
            onChange={e => {
              setFontSize(e.target.value);
            }}
            sx={{mt: "10px", ml: "15px", input: {color: "primary.50"}}}
            size={"small"}
            label="Font size"
            type="number"
            InputLabelProps={{
              shrink: true,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={saveSettings} autoFocus>
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  // Return the app bar component
  return (
    <ThemeProvider theme={workspaceTheme}>
      <Box
        height={"50px"}
        bgcolor={"background.cloverAppBar"}
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}>
        <Box display={"flex"} gap={"15px"} ml={"10px"}>
          <Tooltip title="Back to dashboard" disableInteractive>
            <IconButton aria-label="exit" color="primary" href={"/instances"}>
              <ExitToAppRoundedIcon sx={{transform: "rotate(180deg)"}} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Settings" disableInteractive>
            <IconButton
              color="primary"
              onClick={() => {
                setOpenSettings(true);
              }}>
              <SettingsRoundedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Share template" disableInteractive>
            <IconButton color="primary">
              <ShareRoundedIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <Tooltip title={instanceName}>
          <Typography
            position={"absolute"}
            sx={{
              maxWidth: "400px",
              textAlign: "center",
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
              color: "#b0b1b2",
              lineHeight: 1.2,
              left: "50%",
              transform: "translate(-50%, 0)",
              fontFamily:
                "system-ui, -apple-system, Segoe UI, Roboto, Cantarell, sans-serif",
              fontWeight: 400,
              fontSize: "15px",
            }}>
            {instanceName}
          </Typography>
        </Tooltip>
        <Box display={"flex"} gap={"15px"} mr={"10px"}>
          <Button
            sx={{textTransform: "none", fontWeight: 400}}
            variant="outlined"
            startIcon={<SearchRoundedIcon />}
            size={"small"}>
            Search templates...
          </Button>
          <Tooltip title="Open user settings" disableInteractive>
            <IconButton onClick={handleOpenUserMenu} sx={{p: 0}}>
              <Avatar
                sx={{
                  height: "32px",
                  width: "32px",
                  bgcolor: "primary.200",
                }}>
                {username ? username.split("")[0].toUpperCase() : ""}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            sx={{mt: "45px"}}
            id="menu-appbar"
            anchorEl={anchorElUser}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}>
            <MenuItem
              onClick={handleCloseUserMenu}
              style={{opacity: 1}}
              disabled>
              <Avatar
                sx={{
                  height: "24px",
                  width: "24px",
                  bgcolor: "primary.200",
                }}
              />
              <Typography textAlign="center" color={"primary.500"} ml={"8px"}>
                {username}
              </Typography>
            </MenuItem>
            <MenuItem
              onClick={() => {
                localStorage.getItem("uid")
                  ? localStorage.removeItem("uid")
                  : sessionStorage.removeItem("uid");
                window.location.href = "/signin";
              }}>
              <ExitToAppRoundedIcon />
              <Typography textAlign="center" ml={"8px"}>
                Log out
              </Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Box>
      <Settings />
    </ThemeProvider>
  );
}
