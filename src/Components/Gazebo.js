import React, {useRef, Suspense, useEffect} from "react";
import {OrbitControls, Sky, Svg} from "@react-three/drei";
import {useLoader} from "@react-three/fiber";
import {Canvas} from "@react-three/fiber";
import {TextureLoader} from "three/src/loaders/TextureLoader";
import {RepeatWrapping} from "three";
import CloverBody from "../assets/modelsJSX/CloverBody";
import CloverGuards from "../assets/modelsJSX/CloverGuards";
import PropCW from "../assets/modelsJSX/PropCW";
import PropCCW from "../assets/modelsJSX/PropCCW";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import {io} from "socket.io-client";
import {CircularProgress, Paper} from "@mui/material";
import {theme} from "../App";
import {ThemeProvider} from "@mui/material/styles";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import Typography from "@mui/material/Typography";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

const socket = io(process.env.REACT_APP_SERVER_LINK);

const Clover = props => {
  const group = useRef();
  return (
    <group
      ref={group}
      dispose={null}
      position={props.position}
      rotation={props.rotation}>
      <CloverBody position={[0, 0, 0]} scale={[10, 10, 10]} />
      <CloverGuards position={[0, 0, 0]} scale={[10, 10, 10]} />
      <PropCW
        position={[-0.826, 0, 0.826]}
        scale={[10, 10, 10]}
        rotation={[0, -props.propRotation, 0]}
      />
      <PropCCW
        position={[0.826, 0, 0.826]}
        scale={[10, 10, 10]}
        rotation={[0, props.propRotation, 0]}
      />
      <PropCW
        position={[0.826, 0, -0.826]}
        scale={[10, 10, 10]}
        rotation={[0, -props.propRotation, 0]}
      />
      <PropCCW
        position={[-0.826, 0, -0.826]}
        scale={[10, 10, 10]}
        rotation={[0, props.propRotation, 0]}
      />
    </group>
  );
};

const arucoMarkersGlobal = [];
let arucoMarkersReceived = false;
let stateRequested = false;
let globalMode = "play";

export default function Gazebo(props) {
  const [gazeboRunning, setGazebo] = React.useState(false);
  const [runGazeboButtonState, disableRunGazebo] = React.useState(true);

  const [arucoMarkers, setArucoMarkers] = React.useState([]);

  const [cloverPosition, setCloverPosition] = React.useState([0, 0, 0]);
  const [cloverRotation, setCloverRotation] = React.useState([0, 0, 0]);
  const [propRotation, setPropRotation] = React.useState(0);
  const [telem, setTelem] = React.useState(false);
  const [editArucoComponent, setEditArucoComponent] = React.useState();

  const [mode, setMode] = React.useState("play");

  const ArucoPreview = props => {
    const [arucoImg, setArucoImg] = React.useState(
      props.type === "svg"
        ? `data:image/svg+xml;utf8,${props.image}`
        : props.image,
    );
    const [fileType, setFileType] = React.useState(props.type);
    const inputArucoRef = useRef();
    const handleArucoUpload = () => {
      inputArucoRef.current?.click();
    };
    const handleArucoFileChange = e => {
      if (!e.target.files) {
        return;
      }
      if (
        e.target.files[0].type === "image/svg+xml" ||
        e.target.files[0].type === "image/png"
      ) {
        setFileType(e.target.files[0].type === "image/svg+xml" ? "svg" : "png");
        setArucoImg(URL.createObjectURL(e.target.files[0]));
      }
    };
    return (
      <Paper
        elevation={0}
        sx={{
          backdropFilter: "blur(5px)",
          bgcolor: "rgba(28,27,34,0.5)",
        }}>
        <Box
          position={"relative"}
          width={"200px"}
          height={"240px"}
          display={"flex"}
          pl={"4px"}
          pr={"4px"}
          flexDirection={"column"}>
          <Box
            display={"flex"}
            justifyContent={"space-between"}
            alignItems={"center"}
            mt={"8px"}>
            <Typography color={"primary.50"} variant={"overline"}>
              Aruco marker
            </Typography>
            <img
              onClick={handleArucoUpload}
              src={arucoImg}
              alt={"aruco marker"}
              height={"64px"}
              width={"64px"}
              style={{borderRadius: "4px", cursor: "pointer"}}
            />
            <input
              accept="image/png, image/svg+xml"
              type="file"
              ref={inputArucoRef}
              onChange={handleArucoFileChange}
              style={{display: "none"}}
            />
          </Box>
          <Typography color={"primary.50"} variant={"overline"} mt={"25px"}>
            Position: x: {props.position[0]}, y: {props.position[1]}
          </Typography>
          <Box position={"absolute"} right={"4px"} bottom={"8px"}>
            {" "}
            <Button
              sx={{color: "primary.50"}}
              onClick={() => {
                const marker = arucoMarkersGlobal.filter(
                  m => m.props.position === props.position,
                )[0];
                arucoMarkersGlobal[arucoMarkersGlobal.indexOf(marker)] =
                  fileType === "svg" ? (
                    <Aruco
                      position={props.position}
                      image={arucoImg.split("data:image/svg+xml;utf8,")[1]}
                      key={marker.key}
                    />
                  ) : (
                    <PngMarker
                      position={props.position}
                      image={arucoImg}
                      key={marker.key}
                    />
                  );
                setArucoMarkers([...arucoMarkersGlobal]);
                setArucoImg(null);
                setEditArucoComponent(null);
              }}>
              ok
            </Button>
          </Box>
        </Box>
      </Paper>
    );
  };

  const clickOnAruco = (image, position, type) => {
    if (globalMode === "edit") {
      setEditArucoComponent(
        <ArucoPreview image={image} position={position} type={type} />,
      );
    }
  };

  const Aruco = props => {
    const [hovered, setHovered] = React.useState(false);

    useEffect(() => {
      document.body.style.cursor = hovered ? "pointer" : "auto";
    }, [hovered]);
    return (
      <Svg
        onClick={() => {
          clickOnAruco(props.image, props.position, "svg");
        }}
        onPointerOver={() => {
          if (globalMode === "edit") {
            setHovered(true);
          }
        }}
        onPointerOut={() => setHovered(false)}
        src={`data:image/svg+xml;utf8,${props.image}`}
        rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
        position={[
          parseFloat(props.position[1]) * 10 + 2.1,
          -0.86,
          parseFloat(props.position[0]) * 10 - 2.1,
        ]}
        scale={[0.88 * 0.6, 0.88 * 0.6, 1]}
      />
    );
  };

  const PngMarker = props => {
    const marker = useLoader(TextureLoader, props.image);
    const [hovered, setHovered] = React.useState(false);

    useEffect(() => {
      document.body.style.cursor = hovered ? "pointer" : "auto";
    }, [hovered]);
    return (
      <mesh
        onClick={() => {
          clickOnAruco(props.image, props.position, "png");
        }}
        onPointerOver={() => {
          if (globalMode === "edit") {
            setHovered(true);
          }
        }}
        onPointerOut={() => setHovered(false)}
        rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
        position={[
          parseFloat(props.position[1]) * 10,
          -0.86,
          parseFloat(props.position[0]) * 10,
        ]}>
        <planeGeometry args={[8 * 0.88 * 0.6, 8 * 0.88 * 0.6]} />
        <meshStandardMaterial map={marker} />
      </mesh>
    );
  };

  const handleModeChange = (event, newMode) => {
    if (newMode === "play") {
      console.log("play mode");
    } else if (newMode === "edit") {
      console.log("edit mode");
    }
    setMode(newMode);
    globalMode = newMode;
  };

  socket.on("CloverPosition", data => {
    const pos = [
      data.position[0] * 10,
      data.position[1] * 10,
      data.position[2] * 10,
    ];
    if (data.armed) {
      if (propRotation >= Math.PI * 2) {
        setPropRotation(0);
      } else {
        setPropRotation(prev => prev + 0.7);
      }
    }
    if (
      !(
        Math.abs(data.position[0] - cloverPosition[0]) > 4 ||
        Math.abs(data.position[1] - cloverPosition[1]) > 4 ||
        Math.abs(data.position[2] - cloverPosition[2]) > 4
      )
    ) {
      setCloverPosition(pos);
    }
    setCloverRotation([-data.rotation[0], data.rotation[1], -data.rotation[2]]);
    if (!telem) {
      setTelem(true);
    }
  });
  socket.on("DebugOutput", data => {
    console.log(data);
  });
  if (!stateRequested) {
    socket.emit("GetGazeboState", props.instanceID);
    stateRequested = true;
  }
  useEffect(() => {
    socket.on("GazeboStateRes", state => {
      if (state) {
        setGazebo(true);
        socket.emit("GetGazeboModels", props.instanceID);
      } else {
        disableRunGazebo(false);
      }
    });
  });

  const runGazebo = e => {
    e.preventDefault();
    setGazebo(true);
    socket.emit("RunGazebo", props.instanceID);
  };
  useEffect(() => {
    socket.on("GazeboModels", models => {
      if (!arucoMarkersReceived) {
        for (let i = 0; i < models.length; i++) {
          if (arucoMarkersGlobal.length < models.length) {
            arucoMarkersGlobal.push(
              <Aruco
                position={models[i].position}
                image={models[i].image}
                key={i}
              />,
            );
          }
        }
        arucoMarkersReceived = true;
      }
    });
    const checkMarkers = setInterval(() => {
      if (arucoMarkersGlobal.length > 0) {
        setArucoMarkers(arucoMarkersGlobal);
        clearInterval(checkMarkers);
      }
    }, 10);
  }, []);

  const texture = useLoader(TextureLoader, "/models/floor.jpg");
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(10, 10);
  return (
    <ThemeProvider theme={theme}>
      <Box
        height={"100%"}
        width={"100%"}
        bgcolor={"background.cloverMain"}
        position={"relative"}>
        {gazeboRunning ? (
          <Box height={"100%"}>
            {telem ? (
              <>
                <Box
                  position={"absolute"}
                  sx={{
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: "100",
                  }}>
                  {editArucoComponent}
                </Box>
                <Box
                  position={"absolute"}
                  top={0}
                  left={0}
                  sx={{zIndex: "99"}}
                  display={"flex"}
                  gap={"10px"}
                  flexDirection={"column"}>
                  <ToggleButtonGroup
                    value={mode}
                    exclusive
                    onChange={handleModeChange}
                    orientation="vertical"
                    size="small"
                    aria-label="mode">
                    <ToggleButton value="play" aria-label="play">
                      <PlayArrowRoundedIcon />
                    </ToggleButton>
                    <ToggleButton value="edit" aria-label="edit">
                      <EditRoundedIcon />
                    </ToggleButton>
                  </ToggleButtonGroup>
                  <ToggleButtonGroup
                    exclusive
                    size="small"
                    aria-label="restart">
                    <ToggleButton
                      value="restart"
                      aria-label="restart"
                      onClick={() => {
                        console.log("restart gazebo");
                      }}>
                      <RestartAltRoundedIcon />
                    </ToggleButton>
                  </ToggleButtonGroup>
                  <ToggleButtonGroup
                    exclusive
                    size="small"
                    aria-label="add cube">
                    <ToggleButton
                      value="add cube"
                      aria-label="add cube"
                      onClick={() => {
                        console.log("add cube");
                      }}>
                      <AddRoundedIcon />
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              </>
            ) : (
              <Box
                height={"100%"}
                width={"100%"}
                display={"flex"}
                justifyContent={"center"}
                alignItems={"center"}
                bgcolor={"background.cloverMain"}
                position={"absolute"}
                top={0}
                left={0}
                sx={{zIndex: "199"}}>
                <CircularProgress color={"primary"} />
              </Box>
            )}
            <Canvas
              frameloop="demand"
              dpr={[1, 2]}
              camera={{
                position: [-3, 3, 5],
                fov: 90,
              }}>
              <Suspense>
                <hemisphereLight
                  intensity={0.2}
                  color="#f5f3ff"
                  groundColor="#a78bfa"
                />
                <directionalLight
                  intensity={0.2}
                  position={[-200, 400, -200]}
                />
                <Sky />
                <Clover
                  position={cloverPosition}
                  rotation={cloverRotation}
                  propRotation={propRotation}
                />
                {arucoMarkers}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.87, 0]}>
                  <planeGeometry args={[500, 500]} />
                  <meshStandardMaterial map={texture} />
                </mesh>
                <OrbitControls />
              </Suspense>
            </Canvas>
          </Box>
        ) : (
          <Button
            disabled={runGazeboButtonState}
            variant={"contained"}
            onClick={runGazebo}
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}>
            Run Gazebo
          </Button>
        )}
      </Box>
    </ThemeProvider>
  );
}
