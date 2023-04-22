import * as React from "react";
import {useContext} from "react";
import {
  SettingsContext,
  workspaceTheme,
  InstanceErrorContext,
  hidePreloader,
} from "./Workspace";
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
  DialogContentText,
  DialogTitle,
  Menu,
  MenuItem,
  Paper,
  styled,
  TextField,
  Tooltip,
  InputAdornment,
  Snackbar,
  Alert,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import ExitToAppRoundedIcon from "@mui/icons-material/ExitToAppRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import {socket} from "./Instances";
import {useSearchParams} from "react-router-dom";
import {TwitterPicker} from "react-color";
import TemplateBrowser from "./TemplateBrowser";
import HelpRoundedIcon from "@mui/icons-material/HelpRounded";

const StyledPaper = styled(Paper)`
  background-color: #2a2931;
  background-image: none;
`;
let instanceDataReceived = false;

export const WorkspaceTextField = styled(TextField)({
  "& label.Mui-focused": {
    color: "#8b5cf6",
  },
  "& .MuiInput-underline:after": {
    borderBottomColor: "#8b5cf6",
  },
  "& .MuiOutlinedInput-input": {
    color: "#f5f3ff",
  },
  "& .MuiInput-input": {
    color: "#f5f3ff",
  },
  "& .MuiOutlinedInput-root": {
    "&:hover fieldset": {
      borderColor: "#ddd6fe",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#8b5cf6",
    },
  },
});

// A component that returns app bar for workspace
export default function WorkspaceAppBar(props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [instanceName, setInstanceName] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [openSettings, setOpenSettings] = React.useState(false);
  const [openTBrowser, setOpenTBrowser] = React.useState(false);
  const [openShareTemplate, setOpenShareTemplate] = React.useState(false);
  const [templateCreated, setTemplateCreated] = React.useState(false);
  const {instanceError, setInstanceError} = useContext(InstanceErrorContext);

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
        if (data.instance_state === "Stopped") {
          setInstanceError(1);
          props.hidePreloader();
        } else if (data.instance_state === "No access") {
          setInstanceError(2);
          props.hidePreloader();
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

  // Close templateCreated alert
  const handleCloseTemplateCreated = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setTemplateCreated(false);
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

    // Get a response from the server about creating a template
    socket.on("TemplateCreated", () => {
      setTemplateCreated(true);
    });

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
        aria-labelledby="settings-dialog-title">
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
          <WorkspaceTextField
            value={fontSize}
            onChange={e => {
              setFontSize(e.target.value);
            }}
            sx={{mt: "10px", ml: "15px"}}
            size={"small"}
            label="Font size"
            type="number"
            InputLabelProps={{
              shrink: true,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenSettings(false);
            }}>
            Cancel
          </Button>
          <Button onClick={saveSettings} autoFocus>
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const ShareTemplate = () => {
    const [name, setName] = React.useState("");
    const [description, setDescription] = React.useState("");
    const share = () => {
      socket.emit("CreateNewTemplate", {
        uid: uid,
        workspaceName: instanceName,
        name: name,
        description: description,
        instanceID: instanceID,
      });
      setOpenShareTemplate(false);
    };

    return (
      <Dialog
        fullWidth
        maxWidth={"sm"}
        PaperComponent={StyledPaper}
        open={openShareTemplate}
        onClose={() => {
          setOpenShareTemplate(false);
        }}
        aria-labelledby="share-template-dialog-title"
        aria-describedby="share-template-dialog-description">
        <DialogTitle id="share-template-dialog-title" color={"primary.50"}>
          {"Share template"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="share-template-dialog-description"
            sx={{color: "#b1b9bc"}}>
            Please provide some additional information.
          </DialogContentText>
          <Box display={"flex"} flexDirection={"column"} gap={"10px"}>
            <WorkspaceTextField
              value={name}
              onChange={e => {
                setName(e.target.value);
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip
                      title={
                        "Provide a name for your template. It will be displayed in the Template Browser. Remember: A name that conveys the essence of the template will help other users find the template faster."
                      }
                      disableInteractive
                      placement={"right"}>
                      <HelpRoundedIcon sx={{color: "action.active"}} />
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
              fullWidth
              margin="normal"
              required
              label="Name"
              autoComplete="name"
              autoFocus
            />
            <WorkspaceTextField
              value={description}
              onChange={e => {
                setDescription(e.target.value);
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip
                      title={
                        "Provide a description for your template. A good description will help users understand what your template offers and why they should install it."
                      }
                      disableInteractive
                      placement={"right"}>
                      <HelpRoundedIcon sx={{color: "action.active"}} />
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
              fullWidth
              margin="normal"
              required
              label="Description"
              autoComplete="description"
              multiline
              maxRows={4}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenShareTemplate(false);
            }}>
            Cancel
          </Button>
          <Button onClick={share} autoFocus>
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
            <IconButton
              color="primary"
              onClick={() => {
                setOpenShareTemplate(true);
              }}>
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
            onClick={() => {
              setOpenTBrowser(true);
              socket.emit("GetTemplates", uid);
            }}
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
      <ShareTemplate />
      <TemplateBrowser
        openTBrowser={openTBrowser}
        setOpenTBrowser={setOpenTBrowser}
      />
      <Snackbar
        open={templateCreated}
        autoHideDuration={6000}
        onClose={handleCloseTemplateCreated}>
        <Alert
          onClose={handleCloseTemplateCreated}
          severity="success"
          sx={{width: "100%"}}>
          Your template is created! Now you can find it in the Template Browser.
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}
