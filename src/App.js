import * as React from "react";
import Box from "@mui/material/Box";
import {createTheme, styled, ThemeProvider} from "@mui/material/styles";
import wallpaper from "./assets/wallpaper.jpg";
import Terminal from "./Components/Terminal";
import {Tooltip} from "@mui/material";
import files from "./assets/dock/files.svg";
import terminal from "./assets/dock/terminal.svg";
import vscode from "./assets/dock/vscode.svg";
import gazebo from "./assets/dock/gazebo.svg";
import Fade from "@mui/material/Fade";
import {Rnd} from "react-rnd";
import CircleIcon from "@mui/icons-material/Circle";

//number of running apps
let instanceIndex = 0;

//global theme for the whole app
export const theme = createTheme({
  palette: {
    primary: {
      50: "#f5f3ff",
      100: "#ede9fe",
      200: "#ddd6fe",
      300: "#c4b5fd",
      400: "#a78bfa",
      500: "#8b5cf6",
      600: "#7c3aed",
      700: "#6d28d9",
      800: "#5b21b6",
      900: "#4c1d95",
    },
    background: {
      default: "rgba(33,29,42,0.9)",
      dock: "rgba(255,255,255,0.7)",
    },
    text: {
      primary: "#fff",
      dir: "#a78bfa",
      execDir: "#8b5cf6",
    },
  },
});

//main function
export default function App() {
  //all running apps
  const [instances, setInstances] = React.useState([]);

  //dock panel
  const Dock = () => {
    //container for each application launcher icon with changing bg on hover
    const IconAppContainer = styled(Box)`
      ${({theme}) => `
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 5px;
    width: 50px;
    margin: 2px;
    transition: ${theme.transitions.create(["background-color"], {
      duration: theme.transitions.duration.standard,
    })};
    &:hover {
      background-color: #f5f3ff;
    }
  `}
    `;

    //application launcher icon
    const IconApp = props => {
      return (
        <IconAppContainer onClick={props.onClick}>
          <Tooltip title={props.title}>
            <img
              src={props.src}
              width={props.width}
              alt={props.title}
              style={{cursor: "pointer"}}
            />
          </Tooltip>
        </IconAppContainer>
      );
    };

    //return dock element
    return (
      <ThemeProvider theme={theme}>
        <Box
          position={"absolute"}
          ml={"auto"}
          mr={"auto"}
          left={0}
          right={0}
          bottom={"10px"}
          width={"200px"}
          display={"flex"}
          justifyContent={"space-between"}
          bgcolor={theme.palette.background.dock}
          pl={"30px"}
          pr={"30px"}
          borderRadius={"32px"}
          sx={{backdropFilter: "blur(10px)"}}>
          <IconApp src={files} width={42} title={"File Manager"} />
          <IconApp
            src={terminal}
            width={38}
            title={"Terminal"}
            onClick={() => {
              launchApp("terminal");
            }}
          />
          <IconApp src={vscode} width={33} title={"Code Editor"} />
          <IconApp src={gazebo} width={42} title={"Gazebo"} />
        </Box>
      </ThemeProvider>
    );
  };

  //container for each app with controls
  const AppContainer = props => {
    const [draggable, disableDraggable] = React.useState(false);
    const [opened, setOpened] = React.useState(true);
    const [size, setSize] = React.useState({width: 700, height: 400});
    const [position, setPosition] = React.useState({
      x: window.innerWidth / 2 - 350,
      y: window.innerHeight / 2 - 200,
    });
    const [fullscreenMode, setFullscreenMode] = React.useState(false);
    const [prevPosition, setPrevPosition] = React.useState();
    const [prevSize, setPrevSize] = React.useState();

    return (
      <Fade in={opened}>
        <Box>
          <Rnd
            enableResizing={!draggable}
            disableDragging={draggable}
            minHeight={200}
            minWidth={250}
            size={size}
            position={position}
            onDragStop={(e, d) => {
              setPosition({x: d.x, y: d.y});
              setPrevPosition({x: d.x, y: d.y});
            }}
            onResizeStop={(e, direction, ref, delta, position) => {
              setSize({
                width: ref.style.width,
                height: ref.style.height,
              });
              setPrevSize({
                width: ref.style.width,
                height: ref.style.height,
              });
              setPrevPosition(position);
              setPosition(position);
            }}
            resizeHandleStyles={{
              left: {cursor: "e-resize"},
              right: {cursor: "ew-resize"},
              top: {cursor: "s-resize"},
              bottom: {cursor: "s-resize"},
            }}>
            <Box
              sx={{cursor: "auto"}}
              bgcolor={theme.palette.background.default}
              boxShadow={"4px 4px 26px 1px rgba(0, 0, 0, 0.47)"}
              borderRadius={"18px"}
              position={"absolute"}
              m={"auto"}
              left={0}
              right={0}
              top={0}
              bottom={0}>
              <Box mb={"10px"} ml={"14px"} mr={"14px"}>
                <Box position={"absolute"} top={0} right={0} display={"flex"}>
                  <Box
                    m={"1px"}
                    p={"5px"}
                    onClick={() => {
                      setOpened(prev => !prev);
                    }}>
                    <Tooltip title={"Minimize"}>
                      <CircleIcon
                        sx={{
                          fontSize: 17,
                          color: theme.palette.success.light,
                          ":hover": {color: theme.palette.success.dark},
                        }}
                      />
                    </Tooltip>
                  </Box>
                  <Box
                    m={"1px"}
                    p={"5px"}
                    onClick={() => {
                      if (!fullscreenMode) {
                        setFullscreenMode(true);
                        setPosition({
                          x: 0,
                          y: 0,
                        });
                        setSize({width: "100%", height: "100%"});
                        disableDraggable(true);
                      } else {
                        setSize(prevSize);
                        setPosition(prevPosition);
                        setFullscreenMode(false);
                        disableDraggable(false);
                      }
                    }}>
                    <Tooltip
                      title={
                        fullscreenMode ? "Window Mode" : "Fullscreen Mode"
                      }>
                      <CircleIcon
                        sx={{
                          fontSize: 17,
                          color: theme.palette.warning.light,
                          ":hover": {color: theme.palette.warning.dark},
                        }}
                      />
                    </Tooltip>
                  </Box>
                  <Box
                    m={"1px"}
                    p={"5px"}
                    onClick={() => {
                      setOpened(prev => !prev);
                    }}>
                    <Tooltip title={"Close"}>
                      <CircleIcon
                        sx={{
                          fontSize: 17,
                          color: theme.palette.error.light,
                          ":hover": {color: theme.palette.error.dark},
                        }}
                      />
                    </Tooltip>
                  </Box>
                </Box>
                <Box
                  onMouseOver={() => {
                    disableDraggable(true);
                  }}
                  onMouseOut={() => {
                    if (!fullscreenMode) {
                      disableDraggable(false);
                    }
                  }}>
                  {props.children}
                </Box>
              </Box>
            </Box>
          </Rnd>
        </Box>
      </Fade>
    );
  };

  const launchApp = appName => {
    let app;
    if (appName === "terminal") {
      app = <Terminal instanceIndex={instanceIndex} />;
    }
    setInstances([
      ...instances,
      <AppContainer instanceIndex={instanceIndex} key={instanceIndex}>
        {app}
      </AppContainer>,
    ]);
    instanceIndex++;
  };

  //return root element with wallpaper, dock and apps
  return (
    <ThemeProvider theme={theme}>
      <Box
        position={"relative"}
        width={"100%"}
        height={"100vh"}
        overflow={"hidden"}
        sx={{
          backgroundImage: `url(${wallpaper})`,
          backgroundSize: "cover",
        }}>
        {instances}
        <Dock />
      </Box>
    </ThemeProvider>
  );
}
