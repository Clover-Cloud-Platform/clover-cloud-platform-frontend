import * as React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import {ThemeProvider} from "@mui/material/styles";
import {theme} from "../App";
import {io} from "socket.io-client";
import Typography from "@mui/material/Typography";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import {ReactComponent as FullLogo} from "../assets/clover-cloud-platform-logo-full.svg";
import {ReactComponent as Logo} from "../assets/clover-cloud-platform-logo.svg";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import {CircularProgress, Grow, Tooltip} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import {ReactComponent as StoppedInstance} from "../assets/stoppedInstance.svg";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import StopRoundedIcon from "@mui/icons-material/StopRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import TextField from "@mui/material/TextField";
import Fade from "@mui/material/Fade";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import LaunchRoundedIcon from "@mui/icons-material/LaunchRounded";
import ExitToAppRoundedIcon from "@mui/icons-material/ExitToAppRounded";

//connect to server
const socket = io(process.env.REACT_APP_SERVER_LINK);

//stopper for function that inserts existing instances
let instancesHandled = false;

//instances state buffer
let instanceList = [];

//instance names for checking name availability
const names = [];

//instance counter for instance keys
let instanceCounter = 0;

//counter for loop that inserts existing instances when receiving Username socket
let pushInstanceCounter = 0;

//UID of the user
let uid;

//Page that displays user's instances and makes it possible to manage them and create new ones
export default function Instances() {
  //check UID
  if (!localStorage.getItem("uid") && !sessionStorage.getItem("uid")) {
    //move to sign in page
    window.location.href = "/signin";
  } else {
    //set UID
    uid = localStorage.getItem("uid")
      ? localStorage.getItem("uid")
      : sessionStorage.getItem("uid");
  }

  //username state
  const [username, setUsername] = React.useState("");

  //state of user menu
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  //state of available instances
  const [instances, setInstances] = React.useState([]);

  //state of instance name prompt
  const [openAskNameDialog, setOpenAskNameDialog] = React.useState(false);

  //state of instance name prompt's input
  const [instanceNameValue, setInstanceNameValue] = React.useState("");

  //preloader opacity state for animation
  const [preloaderOpacity, setPreloaderOpacity] = React.useState(1);

  //show/hide preloader
  const [preloader, setPreloader] = React.useState(true);

  //instance names state for checking name availability
  const [instanceNames, setInstanceNames] = React.useState([]);

  //show error that name is already in use
  const [dialogError, setDialogError] = React.useState(false);
  const [dialogHelper, setDialogHelper] = React.useState("");

  const [disableNewInstance, setNewInstanceDisabled] = React.useState(false);

  //open/close user menu
  const handleOpenUserMenu = event => {
    setAnchorElUser(event.currentTarget);
  };
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  //Instance element, with which you can manage the container
  const Instance = props => {
    //state for showing / hiding the instance
    const [container, setContainer] = React.useState(true);

    //state to change active instance buttons
    const [running, setRunning] = React.useState(props.running);

    //link to instance workspace
    const [link, setLink] = React.useState(props.link);

    //disable (while creating) / enable instance
    const [disabled, setDisabled] = React.useState(!props.init);

    socket.on("InstanceCreated", data => {
      if (data.name === props.name) {
        //set link to the workspace
        setLink(data.code);
        //enable instance
        setDisabled(false);
        //enable create new button
        setNewInstanceDisabled(false);
      }
    });
    return (
      <Grow in={container}>
        <Box
          sx={{
            boxShadow:
              "0 1px 2px 0 rgba(60,64,67,.3),0 1px 3px 1px rgba(60,64,67,.15)",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mt: "20px",
          }}
          maxWidth={"1000px"}
          height={"70px"}
          width={"100%"}>
          <Box display={"flex"} alignItems={"center"}>
            <Box ml={"20px"}>
              <StoppedInstance height={"40px"} width={"40px"} />
            </Box>
            <Typography
              sx={{
                ml: "20px",
                fontFamily: "Inter,sans-serif",
                fontWeight: 600,
                color: "#524d56",
                maxWidth: "500px",
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
              }}>
              {props.name}
            </Typography>
            <CircularProgress
              size={"1.3rem"}
              sx={{
                ml: "20px",
                display: disabled ? "visible" : "none",
              }}
              color={"warning"}
            />
          </Box>
          <Box display={"flex"} alignItems={"center"} mr={"20px"} gap={"10px"}>
            <Button
              disabled={disabled || running}
              onClick={() => {
                //send delete instance request
                socket.emit("DeleteInstance", {
                  uid: uid,
                  cont_name: props.name,
                });
                //hide instance
                setContainer(false);
                //reload page and display existing instances
                setTimeout(() => {
                  window.location.reload();
                }, 250);
              }}
              variant="outlined"
              size="small"
              color={"error"}
              endIcon={<DeleteRoundedIcon />}>
              Delete
            </Button>
            <Button
              disabled={disabled || !running}
              onClick={() => {
                //send stop instance request
                socket.emit("StopInstance", {uid: uid, cont_name: props.name});
                //disable button
                setDisabled(true);
                socket.on("InstanceStopped", name => {
                  if (name == props.name) {
                    setDisabled(false);
                    setRunning(false);
                  }
                });
              }}
              variant="outlined"
              size="small"
              color={"error"}
              endIcon={<StopRoundedIcon />}>
              Stop
            </Button>
            <Button
              disabled={disabled || running}
              onClick={() => {
                //send run instance request
                socket.emit("StartInstance", {uid: uid, cont_name: props.name});
                //disable button
                setDisabled(true);
                socket.on("InstanceStarted", name => {
                  if (name == props.name) {
                    setDisabled(false);
                    setRunning(true);
                  }
                });
              }}
              color={"success"}
              variant="outlined"
              size="small"
              endIcon={<PlayArrowRoundedIcon />}>
              Run
            </Button>
            <IconButton
              href={`/clover?id=${link}`}
              aria-label="open"
              color="primary"
              disabled={disabled || !running}>
              <LaunchRoundedIcon />
            </IconButton>
          </Box>
        </Box>
      </Grow>
    );
  };

  //request for username and available instances
  socket.emit("GetUsername", uid);
  //handle response
  socket.on("Username", data => {
    //check stopper
    if (!instancesHandled) {
      if (data.username) {
        //set username
        setUsername(data.username);
      } else {
        //if UID is invalid remove it, or if it not exists, move to sign in page
        if (localStorage.getItem("uid")) {
          localStorage.removeItem("uid");
        } else if (sessionStorage.getItem("uid")) {
          sessionStorage.removeItem("uid");
        }
        window.location.href = "/signin";
      }
      if (data.cont_list) {
        const instanceNames = Object.keys(data.cont_list);
        //insert instances
        for (
          pushInstanceCounter;
          pushInstanceCounter < 2;
          pushInstanceCounter++
        ) {
          const name = instanceNames[pushInstanceCounter];
          if (name) {
            names.push(name);
            instanceList.push(
              <Instance
                link={data.cont_list[name][0]}
                init={true}
                running={data.cont_list[name][1]}
                key={pushInstanceCounter}
                num={pushInstanceCounter}
                name={name}
              />,
            );
            instanceCounter++;
          }
        }
        setInstanceNames(names);
        setInstances(instanceList);
        setPreloaderOpacity(0);
        setTimeout(() => {
          setPreloader(false);
        }, 225);
      }
      //stop the loop
      setTimeout(() => {
        instancesHandled = true;
      }, 1);
    }
  });

  //handle new instance name
  const handleSubmitAskNameDialog = event => {
    event.preventDefault();
    //close the dialog
    setOpenAskNameDialog(false);

    //disable new instance button
    setNewInstanceDisabled(true);

    const name = instanceNameValue.trim();
    const key = instanceCounter;
    if (instances.length < 2) {
      setInstanceNames([...instanceNames, name]);
      //send create new instance request
      socket.emit("CreateNewInstance", {
        uid: uid,
        cont_name: name,
      });
      setInstances([
        ...instances,
        <Instance
          key={key}
          num={key}
          name={name}
          running={false}
          init={false}
          link={""}
        />,
      ]);
      instanceList.push(
        <Instance
          key={key}
          num={key}
          name={name}
          running={false}
          init={false}
          link={""}
        />,
      );
      instanceCounter++;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      {preloader ? (
        <Box
          style={{
            transition: "opacity 225ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
            opacity: preloaderOpacity,
          }}
          position={"fixed"}
          height={"100vh"}
          zIndex={99999}
          bgcolor={"#fff"}
          width={"100%"}
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}>
          <CircularProgress size={"60px"} sx={{position: "absolute"}} />
          <Logo width={"40px"} />
        </Box>
      ) : (
        <></>
      )}
      <Box
        bgcolor={"#f8f6f9"}
        sx={{
          display: "flex",
          height: "100vh",
          flexDirection: "column",
        }}>
        <Container maxWidth={"xl"}>
          <Box sx={{flexGrow: 1}}>
            <AppBar
              position="fixed"
              sx={{
                bgcolor: "background.appBar",
                boxShadow:
                  "0 3px 4px 0 rgba(0,0,0,.09),0 3px 3px -2px rgba(0,0,0,.12),0 1px 8px 0 rgba(0,0,0,.1)",
              }}>
              <Toolbar>
                <Box sx={{display: "flex", mr: 1, flexGrow: 1}}>
                  <FullLogo
                    style={{height: "52px", width: "320px", cursor: "pointer"}}
                    onClick={() => {
                      window.location.href = "/";
                    }}
                  />
                </Box>
                <Box sx={{flexGrow: 0}}>
                  <Tooltip title="Open settings">
                    <IconButton onClick={handleOpenUserMenu} sx={{p: 0}}>
                      <Avatar
                        sx={{
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
                      <Typography textAlign="center" color={"primary.500"}>
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
              </Toolbar>
            </AppBar>
          </Box>
          <Box
            mt={"200px"}
            display={"flex"}
            flexDirection={"column"}
            position={"relative"}
            height={"250px"}>
            <Box
              display={"flex"}
              gap={"15px"}
              alignItems={"center"}
              position={"absolute"}
              left={0}
              top={0}>
              <Typography
                sx={{
                  fontFamily: "Google Sans,Noto Sans,sans-serif",
                  letterSpacing: "-.5px",
                  lineHeight: "1.2em",
                  fontWeight: "600",
                  fontSize: "40px",
                  color: "primary.400",
                  ml: "20px",
                }}>
                Your instances
              </Typography>
              <Button
                onClick={() => {
                  //open dialog
                  setOpenAskNameDialog(true);
                }}
                disabled={!(instances.length < 2) || disableNewInstance}
                variant="outlined"
                size="small"
                endIcon={<AddRoundedIcon />}>
                New
              </Button>
              <Dialog
                open={openAskNameDialog}
                onClose={() => {
                  //close dialog
                  setOpenAskNameDialog(false);
                }}>
                <DialogTitle>Instance name</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    Please enter a name for your instance.
                  </DialogContentText>
                  <TextField
                    onChange={e => {
                      const value = e.currentTarget.value;
                      //check if name is not available
                      if (instanceNames.includes(value)) {
                        //show error
                        setDialogError(true);
                        setDialogHelper("This name is already in use");
                      } else {
                        //hide error
                        setDialogError(false);
                        setDialogHelper("");
                      }
                      //set new value to state
                      setInstanceNameValue(value);
                    }}
                    error={dialogError}
                    helperText={dialogHelper}
                    autoFocus
                    margin="dense"
                    id="name"
                    label="Name"
                    fullWidth
                    variant="standard"
                  />
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={() => {
                      //close dialog
                      setOpenAskNameDialog(false);
                    }}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitAskNameDialog}
                    disabled={dialogError || instanceNameValue === ""}>
                    Ok
                  </Button>
                </DialogActions>
              </Dialog>
            </Box>
            <Box
              mt={"70px"}
              display={"flex"}
              justifyContent={"center"}
              alignItems={"center"}
              flexDirection={"column"}
              position={"relative"}>
              <Fade
                in={instanceList.length === 0}
                style={{position: "absolute", top: 0}}>
                <Box mt={"20px"}>
                  <Typography
                    sx={{
                      fontFamily: "Inter,sans-serif",
                      fontSize: "30px",
                      color: "#504e51",
                    }}>
                    You have no instances
                  </Typography>
                </Box>
              </Fade>
              {instances}
            </Box>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
