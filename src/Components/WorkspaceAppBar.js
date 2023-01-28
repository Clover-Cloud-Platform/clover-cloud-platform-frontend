import * as React from "react";

import {workspaceTheme} from "./MainApp";
import {ThemeProvider} from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import {Button, Tooltip} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import ExitToAppRoundedIcon from "@mui/icons-material/ExitToAppRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import {io} from "socket.io-client";
import {useSearchParams} from "react-router-dom";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import Box from "@mui/material/Box";

const socket = io(process.env.REACT_APP_SERVER_LINK);

let instanceDataReceived = false;

export default function WorkspaceAppBar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [instanceName, setInstanceName] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [anchorElUser, setAnchorElUser] = React.useState(null);
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
  socket.emit("GetInstanceData", {uid: uid, instance_id: instanceID});
  socket.on("InstanceData", data => {
    if (!instanceDataReceived) {
      setUsername(data.username);
      setInstanceName(data.instance_name);
      instanceDataReceived = true;
    }
  });

  const handleOpenUserMenu = event => {
    setAnchorElUser(event.currentTarget);
  };
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  return (
    <ThemeProvider theme={workspaceTheme}>
      <Box
        height={"50px"}
        bgcolor={"background.cloverAppBar"}
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}>
        <Box display={"flex"} gap={"15px"} ml={"10px"}>
          <Tooltip title="Back to dashboard">
            <IconButton aria-label="exit" color="primary" href={"/instances"}>
              <ExitToAppRoundedIcon sx={{transform: "rotate(180deg)"}} />
            </IconButton>
          </Tooltip>
          <Button size={"small"} startIcon={<SettingsRoundedIcon />}>
            Settings
          </Button>
          <Button size={"small"} startIcon={<ShareRoundedIcon />}>
            Share Template
          </Button>
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
          <Tooltip title="Open user settings">
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
      </Box>
    </ThemeProvider>
  );
}
