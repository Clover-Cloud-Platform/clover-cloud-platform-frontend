import React, {useRef, Suspense, useEffect} from "react";
import {
  OrbitControls,
  Sky,
  Svg,
  useCursor,
  TransformControls,
  Box as BoxDrei,
  useHelper,
} from "@react-three/drei";
import {useLoader, useThree} from "@react-three/fiber";
import {Canvas} from "@react-three/fiber";
import {TextureLoader} from "three/src/loaders/TextureLoader";
import {RepeatWrapping} from "three";
import CloverBody from "../assets/modelsJSX/CloverBody";
import CloverGuards from "../assets/modelsJSX/CloverGuards";
import PropCW from "../assets/modelsJSX/PropCW";
import PropCCW from "../assets/modelsJSX/PropCCW";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import {socket} from "./Instances";
import {
  CircularProgress,
  FormControl,
  FormLabel,
  Paper,
  Radio,
  RadioGroup,
} from "@mui/material";
import {theme} from "../App";
import {ThemeProvider} from "@mui/material/styles";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import StopRoundedIcon from "@mui/icons-material/StopRounded";
import Typography from "@mui/material/Typography";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import {create} from "zustand";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import AspectRatioRoundedIcon from "@mui/icons-material/AspectRatioRounded";
import OpenWithRoundedIcon from "@mui/icons-material/OpenWithRounded";
import FormControlLabel from "@mui/material/FormControlLabel";
import {RectAreaLightHelper} from "three/examples/jsm/helpers/RectAreaLightHelper";
import * as THREE from "three";

const useStore = create(set => ({
  target: null,
  setTarget: target => set({target}),
}));

let arucoMarkersGlobal = [];
let cubesGlobal = [];
let arucoMarkersReceived = false;
let stateRequested = false;
let globalMode = "play";
let cubeKey = 0;

const Leds = ({count = 58, temp = new THREE.Object3D()}) => {
  const ref = useRef();
  useEffect(() => {
    for (let i = 0; i < count; i++) {
      temp.position.set(
        0.817 * Math.cos((360 / 58) * i * (Math.PI / 180)),
        -0.275,
        0.817 * Math.sin((360 / 58) * i * (Math.PI / 180)),
      );
      temp.rotation.set(0, Math.PI / 2 - (360 / 58) * i * (Math.PI / 180), 0);
      temp.updateMatrix();
      ref.current.setMatrixAt(i, temp.matrix);
      ref.current.setColorAt(i, new THREE.Color("black"));
    }
    ref.current.instanceMatrix.needsUpdate = true;
    ref.current.instanceColor.needsUpdate = true;
    socket.on("LedState", state => {
      if (ref.current) {
        for (let i = 0; i < state.length; i++) {
          ref.current.setColorAt(
            i,
            new THREE.Color(
              Number(state[i][0]) / 255,
              Number(state[i][1]) / 255,
              Number(state[i][2]) / 255,
            ),
          );
        }
        ref.current.instanceColor.needsUpdate = true;
      }
    });
  }, []);
  return (
    <instancedMesh ref={ref} args={[null, null, count]}>
      <boxGeometry args={[0.06, 0.06, 0.015]} />
      <meshBasicMaterial />
    </instancedMesh>
  );
};
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
      <Leds />
    </group>
  );
};

export default function Gazebo(props) {
  const instanceID = props.instanceID;
  const [gazeboRunning, setGazebo] = React.useState(false);
  const [runGazeboButtonState, disableRunGazebo] = React.useState(true);

  const [arucoMarkers, setArucoMarkers] = React.useState([]);

  const [cloverPosition, setCloverPosition] = React.useState([0, 0, 0]);
  const [cloverRotation, setCloverRotation] = React.useState([0, 0, 0]);
  const [propRotation, setPropRotation] = React.useState(0);
  const [telem, setTelem] = React.useState(false);
  const [editArucoComponent, setEditArucoComponent] = React.useState();
  const [cubes, setCubes] = React.useState([]);
  const {target, setTarget} = useStore();

  const [mode, setMode] = React.useState("play");

  const [cubeEditMode, setCubeEditMode] = React.useState("translate");

  const handleCubeEditModeChange = (event, newMode) => {
    setCubeEditMode(newMode);
  };

  const ArucoPreview = props => {
    const [arucoImg, setArucoImg] = React.useState(
      props.type === "svg"
        ? `data:image/svg+xml;utf8,${props.image}`
        : props.image,
    );
    const [fileType, setFileType] = React.useState(props.type);
    const [size, setSize] = React.useState(props.size);
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
          height={"290px"}
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
              marker
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
          <Box mt={"15px"}>
            <FormControl>
              <FormLabel id="size-select">
                <Typography color={"primary.50"} variant={"overline"}>
                  Size
                </Typography>
              </FormLabel>
              <RadioGroup
                value={size}
                onChange={e => {
                  setSize(e.target.value);
                }}
                row
                aria-labelledby="size-select"
                name="size-select-options">
                <FormControlLabel
                  value={0.33}
                  sx={{
                    color: "primary.50",
                  }}
                  control={
                    <Radio
                      size="small"
                      sx={{
                        color: "primary.50",
                        "&.Mui-checked": {
                          color: "primary.50",
                        },
                      }}
                    />
                  }
                  label="0.33"
                />
                <FormControlLabel
                  value={0.22}
                  sx={{
                    color: "primary.50",
                  }}
                  control={
                    <Radio
                      size="small"
                      sx={{
                        color: "primary.50",
                        "&.Mui-checked": {
                          color: "primary.50",
                        },
                      }}
                    />
                  }
                  label="0.22"
                />
              </RadioGroup>
            </FormControl>
          </Box>
          <Typography color={"primary.50"} variant={"overline"} mt={"15px"}>
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
                      name={props.name}
                      size={size}
                      position={props.position}
                      image={arucoImg.split("data:image/svg+xml;utf8,")[1]}
                      key={marker.key}
                    />
                  ) : (
                    <PngMarker
                      name={props.name}
                      size={size}
                      position={props.position}
                      image={arucoImg}
                      key={marker.key}
                    />
                  );
                setArucoMarkers([...arucoMarkersGlobal]);
                setArucoImg(null);
                setEditArucoComponent(null);
                socket.emit("EditMarker", {
                  instanceID: instanceID,
                  aruco_name: props.name,
                  image: fileType === "svg" ? null : arucoImg.text(),
                  type: fileType,
                  size: size,
                  position: props.position,
                });
              }}>
              ok
            </Button>
          </Box>
        </Box>
      </Paper>
    );
  };

  const clickOnAruco = (image, position, type, size, name) => {
    if (globalMode === "edit") {
      setEditArucoComponent(
        <ArucoPreview
          name={name}
          image={image}
          position={position}
          type={type}
          size={size}
        />,
      );
    }
  };

  //aruco size: ((0.22|0.33) / 0.33) * 0.88 * 0.6
  const Aruco = props => {
    const [hovered, setHovered] = React.useState(false);
    useCursor(hovered);
    return (
      <Svg
        onClick={() => {
          clickOnAruco(
            props.image,
            props.position,
            "svg",
            props.size,
            props.name,
          );
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
          parseFloat(props.position[1]) * 10 + 2.1 * (props.size / 0.33),
          -0.86,
          parseFloat(props.position[0]) * 10 - 2.1 * (props.size / 0.33),
        ]}
        scale={[(props.size / 0.33) * 0.528, (props.size / 0.33) * 0.528, 1]}
      />
    );
  };

  const PngMarker = props => {
    const marker = useLoader(TextureLoader, props.image);
    const [hovered, setHovered] = React.useState(false);
    useCursor(hovered);
    return (
      <mesh
        onClick={() => {
          clickOnAruco(props.image, props.position, "png", props.size);
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
        <planeGeometry
          args={[
            (props.size / 0.33) * 0.528 * 8,
            (props.size / 0.33) * 0.528 * 8,
          ]}
        />
        <meshStandardMaterial map={marker} />
      </mesh>
    );
  };

  const Cube = props => {
    const [hovered, setHovered] = React.useState(false);
    const setTarget = useStore(state => state.setTarget);
    useCursor(hovered);
    return (
      <BoxDrei
        {...props}
        onClick={e => {
          if (globalMode === "edit") {
            setTarget(e.object);
          }
        }}
        onPointerOver={() => {
          if (globalMode === "edit") {
            setHovered(true);
          }
        }}
        onPointerOut={() => setHovered(false)}>
        <meshStandardMaterial color={props.color.toLowerCase()} />
      </BoxDrei>
    );
  };

  const addCube = () => {
    socket.emit("AddCube", props.instanceID);
    setCubes([
      ...cubes,
      <Cube
        position={[10, 5 - 0.87, 0]}
        args={[10, 10, 10]}
        color={"gray"}
        key={cubeKey}
        oId={cubeKey}
      />,
    ]);
    cubeKey++;
  };

  const handleModeChange = (event, newMode) => {
    if (newMode === "play") {
      setTarget(null);
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
    setCloverPosition(pos);
    setCloverRotation([data.rotation[1], data.rotation[2], data.rotation[0]]);
    if (!telem) {
      setTelem(true);
    }
  });

  //socket.on("DebugOutput", data => {
  //  console.log(data);
  //});

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
      console.log(models);
      if (!arucoMarkersReceived) {
        for (let i = 0; i < models.aruco_map.length; i++) {
          if (arucoMarkersGlobal.length < models.aruco_map.length) {
            if (models.aruco_map[i].aruco_type === "svg") {
              arucoMarkersGlobal.push(
                <Aruco
                  name={models.aruco_map[i].aruco_name}
                  size={parseFloat(models.aruco_map[i].aruco_size)}
                  position={models.aruco_map[i].position}
                  image={models.aruco_map[i].image}
                  key={i}
                />,
              );
            } else {
              <PngMarker
                name={models.aruco_map[i].aruco_name}
                size={parseFloat(models.aruco_map[i].aruco_size)}
                position={models.aruco_map[i].position}
                image={models.aruco_map[i].image}
                key={i}
              />;
            }
          }
        }

        for (let oId in models.user_objects) {
          cubesGlobal.push(
            <Cube
              position={[
                models.user_objects[oId].position[0] * 10,
                models.user_objects[oId].position[1] * 10 - 0.87,
                models.user_objects[oId].position[2] * 10,
              ]}
              rotation={[
                models.user_objects[oId].rotation[1],
                models.user_objects[oId].rotation[2],
                models.user_objects[oId].rotation[0],
              ]}
              args={[
                models.user_objects[oId].size[0] * 10,
                models.user_objects[oId].size[1] * 10,
                models.user_objects[oId].size[2] * 10,
              ]}
              oId={cubeKey}
              color={models.user_objects[oId].color}
              key={cubeKey}
            />,
          );
          cubeKey++;
        }
        arucoMarkersReceived = true;
      }
    });
    const checkMarkers = setInterval(() => {
      if (arucoMarkersGlobal.length > 0) {
        setArucoMarkers(arucoMarkersGlobal);
        setCubes(cubesGlobal);
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
                  top={"4px"}
                  left={"4px"}
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
                        socket.emit("StopGazebo", props.instanceID);
                        setTimeout(() => {
                          window.location.reload();
                        }, 20);
                      }}>
                      <StopRoundedIcon />
                    </ToggleButton>
                  </ToggleButtonGroup>
                  {mode === "edit" ? (
                    <ToggleButtonGroup
                      exclusive
                      size="small"
                      aria-label="add cube">
                      <ToggleButton
                        value="add cube"
                        aria-label="add cube"
                        onClick={addCube}>
                        <AddRoundedIcon />
                      </ToggleButton>
                    </ToggleButtonGroup>
                  ) : (
                    <></>
                  )}
                </Box>
                <Box
                  position={"absolute"}
                  top={"4px"}
                  right={"4px"}
                  zIndex={99}>
                  {target && mode === "edit" ? (
                    <ToggleButtonGroup
                      size={"small"}
                      value={cubeEditMode}
                      exclusive
                      onChange={handleCubeEditModeChange}
                      aria-label="cube edit mode">
                      <ToggleButton value="translate" aria-label="translate">
                        <OpenWithRoundedIcon />
                      </ToggleButton>
                      <ToggleButton value="rotate" aria-label="rotate">
                        <AutorenewRoundedIcon />
                      </ToggleButton>
                      <ToggleButton value="scale" aria-label="scale">
                        <AspectRatioRoundedIcon />
                      </ToggleButton>
                    </ToggleButtonGroup>
                  ) : (
                    <></>
                  )}
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
              onPointerMissed={() => setTarget(null)}
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
                <group dispose={null}>{arucoMarkers}</group>
                <group dispose={null}>{cubes}</group>
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.87, 0]}>
                  <planeGeometry args={[500, 500]} />
                  <meshStandardMaterial map={texture} />
                </mesh>
                {target && (
                  <TransformControls
                    object={target}
                    mode={cubeEditMode}
                    onMouseUp={() => {
                      socket.emit("EditCube", {
                        model_id: String(target.oId),
                        position: [
                          target.position.x / 10,
                          (target.position.y + 0.87) / 10,
                          target.position.z / 10,
                        ],
                        rotation: [
                          target.rotation.x,
                          target.rotation.z,
                          target.rotation.y,
                        ],
                        size: [
                          (target.scale.x * target.geometry.parameters.height) /
                            10,
                          (target.scale.y * target.geometry.parameters.depth) /
                            10,
                          (target.scale.z * target.geometry.parameters.width) /
                            10,
                        ],
                        color: target.color,
                        instanceID: props.instanceID,
                      });
                      console.log(
                        target.position,
                        target.rotation,
                        target.scale,
                      );
                    }}
                  />
                )}
                <OrbitControls makeDefault />
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
