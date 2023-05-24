import * as React from "react";
import {useContext, useEffect} from "react";
import {
  SettingsContext,
  workspaceTheme,
  InstanceErrorContext,
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
import SpaceDashboardIcon from "@mui/icons-material/SpaceDashboard";
import MyTemplates from "./MyTemplates";
import {getAuth, onAuthStateChanged, signOut} from "firebase/auth";
import {initializeApp} from "firebase/app";
import LockResetRoundedIcon from "@mui/icons-material/LockResetRounded";
import {getAnalytics, logEvent} from "firebase/analytics";
const analytics = getAnalytics();
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: "clover-cloud-platform",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};
initializeApp(firebaseConfig);

const StyledPaper = styled(Paper)`
  background-color: #2a2931;
  background-image: none;
`;

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

const auth = getAuth();
let uid;

// A component that returns app bar for workspace
export default function WorkspaceAppBar(props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [instanceName, setInstanceName] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [userPhoto, setUserPhoto] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [openSettings, setOpenSettings] = React.useState(false);
  const [openTBrowser, setOpenTBrowser] = React.useState(false);
  const [openShareTemplate, setOpenShareTemplate] = React.useState(false);
  const [templateCreated, setTemplateCreated] = React.useState(false);
  const [openMyTemplates, setOpenMyTemplates] = React.useState(false);
  const [myTemplates, setMyTemplates] = React.useState([]);
  const {setInstanceError} = useContext(InstanceErrorContext);

  // Get settings
  const {terminalBG, setTerminalBG} = useContext(SettingsContext);
  const {editorFontSize, setEditorFontSize} = useContext(SettingsContext);

  // Get instance id and uid
  const instanceID = searchParams.get("id");
  if (!instanceID) {
    window.location.href = "/instances";
  }

  useEffect(() => {
    onAuthStateChanged(auth, user => {
      if (user) {
        if (
          user.emailVerified ||
          user.providerData[0].providerId !== "password"
        ) {
          uid = user.uid;
          if (user.displayName) {
            setUsername(user.displayName);
          } else {
            setUsername(user.email.split("@")[0]);
          }
          if (user.photoURL) {
            setUserPhoto(user.photoURL);
          }
          // Get instance data - container state and instance name
          socket.emit("GetInstanceData", {uid: uid, instance_id: instanceID});
        } else {
          window.location.href = "/signin";
        }
      } else {
        window.location.href = "/signin";
      }
    });
    socket.on("InstanceData", data => {
      if (data.instance_state) {
        if (data.instance_state === "Stopped") {
          setInstanceError(1);
          props.hidePreloader();
        } else if (data.instance_state === "No access") {
          setInstanceError(2);
          props.hidePreloader();
        }
      }
      setInstanceName(data.instance_name);
      setMyTemplates(data.user_templates);
    });

    socket.on("UserTemplates", templates => {
      setMyTemplates(templates);
    });
  }, []);

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
      localStorage.setItem("config", config);
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
      logEvent(analytics, "create_template");
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
              inputProps={{maxLength: 50}}
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
              inputProps={{maxLength: 150}}
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
          <Button
            onClick={share}
            autoFocus
            disabled={name === "" || description === ""}>
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
              disabled={myTemplates.length >= 5}
              color="primary"
              onClick={() => {
                setOpenShareTemplate(true);
              }}>
              <ShareRoundedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="My templates" disableInteractive>
            <IconButton
              color="primary"
              onClick={() => {
                socket.emit("GetUserTemplates", uid);
                setOpenMyTemplates(true);
              }}>
              <SpaceDashboardIcon />
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
                src={userPhoto}
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
                src={userPhoto}
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
                window.location.href = "/reset";
              }}>
              <LockResetRoundedIcon />
              <Typography textAlign="center" ml={"8px"}>
                Reset password
              </Typography>
            </MenuItem>
            <MenuItem
              onClick={() => {
                signOut(auth).then(() => {
                  window.location.href = "/signin";
                });
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
        currentID={instanceID}
      />
      <MyTemplates
        uid={uid}
        openMyTemplates={openMyTemplates}
        setOpenMyTemplates={setOpenMyTemplates}
        myTemplates={myTemplates}
        setMyTemplates={setMyTemplates}
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
