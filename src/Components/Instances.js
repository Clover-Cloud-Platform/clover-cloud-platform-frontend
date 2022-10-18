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
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import {Grow, Tooltip} from "@mui/material";
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

const socket = io(process.env.REACT_APP_SERVER_LINK);

let instancesHandled = false;

let instanceList = [];
export default function Instances() {
  if (!localStorage.getItem("uid") && !sessionStorage.getItem("uid")) {
    window.location.href = "/signin";
  }

  const [username, setUsername] = React.useState("");
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [instanceCounter, setInstanceCounter] = React.useState(0);
  const [instances, setInstances] = React.useState([]);
  const [openAskNameDialog, setOpenAskNameDialog] = React.useState(false);
  const [instanceNameValue, setInstanceNameValue] = React.useState("");

  const handleOpenUserMenu = event => {
    setAnchorElUser(event.currentTarget);
  };
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const deleteInstance = num => {
    const index = instanceList.indexOf(
      instanceList.find(element => element.key == num),
    );
    if (instanceList.length === 1) {
      instanceList = [];
    } else {
      instanceList.splice(index, 1);
    }
    setInstances(instanceList);
  };
  const Instance = props => {
    const [container, setContainer] = React.useState(true);
    //todo add loading
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
              }}>
              {props.name}
            </Typography>
          </Box>
          <Box display={"flex"} alignItems={"center"} mr={"20px"} gap={"10px"}>
            <Button
              onClick={() => {
                setContainer(false);
                setTimeout(deleteInstance(props.num), 300);
                //todo session storage
                socket.emit("DeleteInstance", {
                  uid: localStorage.getItem("uid"),
                  cont_name: props.name,
                });
              }}
              variant="outlined"
              size="small"
              color={"error"}
              endIcon={<DeleteRoundedIcon />}>
              Delete
            </Button>
            <Button
              disabled
              variant="outlined"
              size="small"
              color={"error"}
              endIcon={<StopRoundedIcon />}>
              Stop
            </Button>
            <Button
              variant="outlined"
              size="small"
              color={"success"}
              endIcon={<PlayArrowRoundedIcon />}>
              Run
            </Button>
          </Box>
        </Box>
      </Grow>
    );
  };

  if (localStorage.getItem("uid")) {
    socket.emit("GetUsername", localStorage.getItem("uid"));
  } else {
    socket.emit("GetUsername", sessionStorage.getItem("uid"));
  }
  socket.on("Username", data => {
    if (!instancesHandled) {
      if (data.username) {
        setUsername(data.username);
      } else {
        window.location.href = "/signin";
      }
      if (data.cont_list) {
        for (let i = 0; i < 2; i++) {
          if (data.cont_list[i]) {
            setInstances([
              ...instances,
              <Instance key={i} num={i} name={data.cont_list[i]} />,
            ]);
            instanceList.push(
              <Instance key={i} num={i} name={data.cont_list[i]} />,
            );
          }
        }
      }
      setTimeout(() => {
        instancesHandled = true;
      }, 1);
    }
  });

  const handleSubmitAskNameDialog = event => {
    event.preventDefault();
    setOpenAskNameDialog(false);
    const name = instanceNameValue.trim();
    if (
      instances.length < 2 &&
      (localStorage.getItem("uid") || sessionStorage.getItem("uid"))
    ) {
      socket.emit("CreateNewInstance", {
        uid: localStorage.getItem("uid")
          ? localStorage.getItem("uid")
          : sessionStorage.getItem("uid"),
        cont_name: name,
      });
      setInstances([
        ...instances,
        <Instance key={instanceCounter} num={instanceCounter} name={name} />,
      ]);
      instanceList.push(
        <Instance key={instanceCounter} num={instanceCounter} name={name} />,
      );
      //TODO disable all buttons and enable loading identification
      setInstanceCounter(prev => prev + 1);
      socket.on("InstanceCreated", () => {
        console.log(1);
        //TODO enable delete and run buttons
      });
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        bgcolor={"#f8f6f9"}
        sx={{
          display: "flex",
          justifyContent: "center",
          height: "100vh",
          flexDirection: "column",
        }}>
        <Container maxWidth={"xl"}>
          <Box sx={{flexGrow: 1}}>
            <AppBar position="fixed">
              <Toolbar>
                <Box sx={{display: "flex", mr: 1, flexGrow: 1}}>
                  <FullLogo style={{height: "52px", width: "320px"}} />
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
                    <MenuItem onClick={handleCloseUserMenu}>
                      <Typography textAlign="center">
                        Change username
                      </Typography>
                    </MenuItem>
                    <MenuItem onClick={handleCloseUserMenu}>
                      <Typography textAlign="center">
                        Change password
                      </Typography>
                    </MenuItem>
                    <MenuItem onClick={handleCloseUserMenu}>
                      <Typography textAlign="center">Log out</Typography>
                    </MenuItem>
                  </Menu>
                </Box>
              </Toolbar>
            </AppBar>
          </Box>
          <Box
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
                  setOpenAskNameDialog(true);
                }}
                disabled={!(instances.length < 2)}
                variant="outlined"
                size="small"
                endIcon={<AddRoundedIcon />}>
                New
              </Button>
              <Dialog
                open={openAskNameDialog}
                onClose={() => {
                  setOpenAskNameDialog(false);
                }}>
                <DialogTitle>Instance name</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    Please enter a name for your instance.
                  </DialogContentText>
                  <TextField
                    onChange={e => {
                      setInstanceNameValue(e.currentTarget.value);
                    }}
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
                      setOpenAskNameDialog(false);
                    }}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmitAskNameDialog}>Ok</Button>
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
