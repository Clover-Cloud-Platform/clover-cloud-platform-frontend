import React, {Suspense, useEffect, useRef} from "react";
import {
  Box as BoxDrei,
  OrbitControls,
  Sky,
  Svg,
  TransformControls,
  useCursor,
} from "@react-three/drei";
import {Canvas, useLoader} from "@react-three/fiber";
import {TextureLoader} from "three/src/loaders/TextureLoader";
import * as THREE from "three";
import {RepeatWrapping} from "three";
import CloverBody from "../assets/modelsJSX/CloverBody";
import CloverGuards from "../assets/modelsJSX/CloverGuards";
import PropCW from "../assets/modelsJSX/PropCW";
import PropCCW from "../assets/modelsJSX/PropCCW";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import {socket} from "./Instances";
import {
  Chip,
  CircularProgress,
  FormControl,
  FormLabel,
  Paper,
  Radio,
  RadioGroup,
  Tooltip,
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
import generateAruco from "./arucogen";
import GenerateArucoDialog from "./GenerateArucoDialog";
import {CirclePicker} from "react-color";
import AddPhotoAlternateRoundedIcon from "@mui/icons-material/AddPhotoAlternateRounded";
import IconButton from "@mui/material/IconButton";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";

const useStore = create(set => ({
  target: null,
  setTarget: target => set({target}),
}));

let arucoMarkersGlobal = [];
let cubesGlobal = [];
let arucoMarkersReceived = false;
let globalMode = "play";
let cubeKey = 0;
let telemGlobal = false;
let platformGeneratedMarkerIndex = 0;

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
    setTimeout(() => {
      ref.current.instanceColor.needsUpdate = true;
    }, 1);
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
  }, [socket]);
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

  const [stopGazeboButton, setStopGazeboButton] = React.useState(true);
  const [runGazeboButton, setRunGazeboButton] = React.useState(false);

  socket.on("GazeboStopped", () => {
    setRunGazeboButton(false);
  });

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
    const [posX, setPosX] = React.useState(props.position[0]);
    const [posY, setPosY] = React.useState(props.position[1]);
    const [openGenArucoDialog, setOpenGenArucoDialog] = React.useState(false);
    const [genArucoId, setGenArucoId] = React.useState(null);
    const [fileContent, setFileContent] = React.useState();

    const inputArucoRef = useRef();
    const handleArucoUpload = () => {
      inputArucoRef.current?.click();
    };
    const handleArucoFileChange = e => {
      if (!e.target.files || e.target.files[0].type !== "image/png") {
        return;
      } else {
        setFileType("png");
        setArucoImg(URL.createObjectURL(e.target.files[0]));
        const reader = new FileReader();
        reader.onload = () => {
          setFileContent(
            reader.result.replace("data:", "").replace(/^.+,/, ""),
          );
        };
        reader.readAsDataURL(e.target.files[0]);
      }
    };
    const handleCloseGenArucoDialog = () => {
      setOpenGenArucoDialog(false);
    };
    const generateMarker = id => {
      setGenArucoId(String(id));
      setOpenGenArucoDialog(false);
      setFileType("svg");
      setArucoImg(`data:image/svg+xml;utf8,${generateAruco(id).outerHTML}`);
    };

    const deleteMarker = () => {
      setArucoImg(null);
      setEditArucoComponent(null);
      arucoMarkersGlobal.splice(
        arucoMarkersGlobal.indexOf(
          arucoMarkersGlobal.filter(
            marker => marker.props.name === props.name,
          )[0],
        ),
        1,
      );
      setArucoMarkers([...arucoMarkersGlobal]);
      socket.emit("DeleteMarker", {instanceId: instanceID, name: props.name});
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
          width={"220px"}
          height={"340px"}
          display={"flex"}
          pl={"6px"}
          pr={"6px"}
          flexDirection={"column"}>
          <Box
            display={"flex"}
            justifyContent={"space-between"}
            alignItems={"center"}
            mt={"8px"}>
            <Typography color={"primary.50"} variant={"overline"}>
              {props.type === "svg" ? `aruco marker` : "png marker"}
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
              accept="image/png"
              type="file"
              ref={inputArucoRef}
              onChange={handleArucoFileChange}
              style={{display: "none"}}
            />
          </Box>
          <Box mt={"15px"}>
            <Button
              fullWidth
              size={"small"}
              sx={{color: "primary.50"}}
              onClick={() => {
                setOpenGenArucoDialog(true);
              }}>
              Generate Aruco marker
            </Button>
            <Button
              fullWidth
              sx={{color: "primary.50"}}
              size={"small"}
              onClick={handleArucoUpload}>
              Upload PNG marker
            </Button>
            <GenerateArucoDialog
              open={openGenArucoDialog}
              handleClose={handleCloseGenArucoDialog}
              generateMarker={generateMarker}
            />
          </Box>
          <Box mt={"15px"}>
            <FormControl>
              <FormLabel id="size-select">
                <Tooltip title={"Size of the marker (m)"} disableInteractive>
                  <Typography color={"primary.50"} variant={"overline"}>
                    Size
                  </Typography>
                </Tooltip>
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
          <Typography
            color={"primary.50"}
            variant={"overline"}
            mt={"15px"}
            sx={{lineHeight: 1}}>
            <Tooltip
              title={"Position of the marker (x, y) m"}
              disableInteractive>
              <span>Position: </span>
            </Tooltip>
            <input
              style={{
                border: "none",
                backgroundColor: "transparent",
                color: theme.palette.primary["50"],
                width: "40px",
                outline: "none",
              }}
              placeholder={"X"}
              color={theme.palette.primary["50"]}
              value={posX}
              onChange={e => {
                setPosX(e.target.value);
              }}
            />
            <input
              style={{
                border: "none",
                backgroundColor: "transparent",
                color: theme.palette.primary["50"],
                width: "40px",
                outline: "none",
              }}
              placeholder={"Y"}
              value={posY}
              onChange={e => {
                setPosY(e.target.value);
              }}
            />
          </Typography>
          <Tooltip
            title={"Delete marker"}
            disableInteractive
            placement={"right"}>
            <IconButton
              onClick={deleteMarker}
              aria-label="delete"
              sx={{
                position: "absolute",
                left: "4px",
                bottom: "8px",
                color: "primary.50",
              }}>
              <DeleteRoundedIcon />
            </IconButton>
          </Tooltip>
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
                      position={[posX, posY]}
                      image={arucoImg.split("data:image/svg+xml;utf8,")[1]}
                      key={marker.key}
                    />
                  ) : (
                    <PngMarker
                      name={props.name}
                      size={size}
                      position={[posX, posY]}
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
                  marker_id: genArucoId,
                  image:
                    fileType === "svg"
                      ? null
                      : fileContent
                      ? fileContent
                      : null,
                  type: fileType,
                  size: size,
                  position: [posX, posY],
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
          (parseFloat(props.position[1]) +
            parseFloat(props.size) * 0.5 +
            0.0625) *
            10,
          -0.86,
          (parseFloat(props.position[0]) -
            parseFloat(props.size) * 0.5 -
            0.0625) *
            10,
        ]}
        scale={[
          (1 / 6) * parseFloat(props.size) * 10,
          (1 / 6) * parseFloat(props.size) * 10,
          1,
        ]}
      />
    );
  };

  const PngMarker = props => {
    let image = props.image;
    if (!image.includes("blob:") && !image.includes("data:")) {
      image = `data:image/png;base64, ${image.slice(2, image.length - 1)}`;
    }
    const marker = useLoader(TextureLoader, image);
    const [hovered, setHovered] = React.useState(false);
    useCursor(hovered);
    return (
      <mesh
        onClick={() => {
          clickOnAruco(image, props.position, "png", props.size, props.name);
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
        <meshStandardMaterial
          color={new THREE.Color(props.color.toLowerCase())}
        />
      </BoxDrei>
    );
  };

  const addCube = () => {
    socket.emit("AddCube", props.instanceID);
    cubesGlobal.push({
      position: [10, 5 - 0.87, 0],
      rotation: [0, 0, 0],
      args: [10, 10, 10],
      color: "#838383",
      oId: cubeKey,
    });
    setCubes([
      ...cubesGlobal.map(cube => (
        <Cube
          position={cube.position}
          rotation={cube.rotation}
          args={cube.args}
          color={cube.color}
          key={cube.oId}
          oId={cube.oId}
        />
      )),
    ]);
    cubeKey++;
  };

  const addMarker = () => {
    platformGeneratedMarkerIndex++;
    const name = `aruco_marker_${props.instanceID}_${platformGeneratedMarkerIndex}`;
    socket.emit("AddMarker", {instanceID: props.instanceID, name: name});
    arucoMarkersGlobal.push(
      <Aruco
        name={name}
        size={0.33}
        position={["0.0", "-1.0"]}
        image={generateAruco(0).outerHTML}
        key={arucoMarkersGlobal.length}
      />,
    );
    setArucoMarkers([...arucoMarkersGlobal]);
  };

  const handleModeChange = (event, newMode) => {
    if (newMode === "play") {
      setTarget(null);
    } else if (newMode === "edit") {
    }
    setMode(newMode);
    globalMode = newMode;
  };

  useEffect(() => {
    if (telem !== telemGlobal) {
      setTelem(telemGlobal);
    }
    if (telemGlobal) {
      setTimeout(() => setStopGazeboButton(false), 5000);
    }
  }, [telemGlobal]);

  useEffect(() => {
    socket.on("CloverPosition", data => {
      if (!telemGlobal) {
        setTelem(true);
        telemGlobal = true;
      }
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
    });
  }, []);

  const runGazebo = e => {
    e.preventDefault();
    setGazebo(true);
    socket.emit("GetGazeboModels", props.instanceID);
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
              arucoMarkersGlobal.push(
                <PngMarker
                  name={models.aruco_map[i].aruco_name}
                  size={parseFloat(models.aruco_map[i].aruco_size)}
                  position={models.aruco_map[i].position}
                  image={models.aruco_map[i].image}
                  key={i}
                />,
              );
            }
            const arucoName = models.aruco_map[i].aruco_name.split("_");
            if (arucoName[2] === props.instanceID) {
              const index = Number(arucoName[3]);
              if (index > platformGeneratedMarkerIndex) {
                platformGeneratedMarkerIndex = index;
              }
            }
          }
        }

        for (let oId in models.user_objects) {
          cubesGlobal.push({
            position: [
              models.user_objects[oId].position[1] * 10,
              models.user_objects[oId].position[2] * 10 - 0.87,
              models.user_objects[oId].position[0] * 10,
            ],
            rotation: [
              models.user_objects[oId].rotation[1],
              models.user_objects[oId].rotation[2],
              models.user_objects[oId].rotation[0],
            ],
            args: [
              models.user_objects[oId].size[0] * 10,
              models.user_objects[oId].size[1] * 10,
              models.user_objects[oId].size[2] * 10,
            ],
            color: models.user_objects[oId].colorHex,
            oId: cubeKey,
          });
          cubeKey++;
        }
        setArucoMarkers([...arucoMarkersGlobal]);
        setCubes([
          ...cubesGlobal.map(cube => (
            <Cube
              position={cube.position}
              rotation={cube.rotation}
              args={cube.args}
              color={cube.color}
              key={cube.oId}
              oId={cube.oId}
            />
          )),
        ]);
        arucoMarkersReceived = true;
      }
    });
  }, [socket]);

  const texture = useLoader(TextureLoader, "/models/floor.jpg");
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(10, 10);

  const hexToGazebo = color => {
    switch (color) {
      case "#0504ff":
        return "Blue";
      case "#fe0405":
        return "Red";
      case "#04ff04":
        return "Green";
      case "#838383":
        return "Gray";
      case "#020202":
        return "Black";
      case "#ffffff":
        return "White";
      case "#ffff00":
        return "Yellow";
      case "#ff9a0e":
        return "Orange";
      case "#ff04ff":
        return "Purple";
    }
  };

  const deleteCube = () => {
    socket.emit("DeleteCube", {
      instanceID: instanceID,
      model_id: String(target.oId),
    });
    cubesGlobal.splice(
      cubesGlobal.indexOf(
        cubesGlobal.filter(cube => cube.oId === target.oId)[0],
      ),
      1,
    );
    setTarget(null);
    setCubes([
      ...cubesGlobal.map(cube => (
        <Cube
          position={cube.position}
          rotation={cube.rotation}
          args={cube.args}
          color={cube.color}
          key={cube.oId}
          oId={cube.oId}
        />
      )),
    ]);
  };

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
                      <Tooltip
                        title={"Switch to play mode"}
                        placement="right"
                        disableInteractive>
                        <PlayArrowRoundedIcon />
                      </Tooltip>
                    </ToggleButton>
                    <ToggleButton value="edit" aria-label="edit">
                      <Tooltip
                        title={"Switch to edit mode"}
                        placement="right"
                        disableInteractive>
                        <EditRoundedIcon />
                      </Tooltip>
                    </ToggleButton>
                  </ToggleButtonGroup>
                  <ToggleButtonGroup
                    exclusive
                    size="small"
                    aria-label="restart">
                    <ToggleButton
                      disabled={stopGazeboButton}
                      value="restart"
                      aria-label="restart"
                      onClick={() => {
                        socket.emit("StopGazebo", props.instanceID);
                        setTimeout(() => {
                          setMode("play");
                          setTarget(null);
                          setArucoMarkers([]);
                          setCubes([]);
                          arucoMarkersGlobal = [];
                          cubesGlobal = [];
                          arucoMarkersReceived = false;
                          globalMode = "play";
                          cubeKey = 0;
                          setTelem(false);
                          telemGlobal = false;
                          setGazebo(false);
                          setRunGazeboButton(true);
                        }, 200);
                      }}>
                      <Tooltip
                        title={"Kill Gazebo"}
                        placement="right"
                        disableInteractive>
                        <StopRoundedIcon />
                      </Tooltip>
                    </ToggleButton>
                  </ToggleButtonGroup>
                  {mode === "edit" ? (
                    <ToggleButtonGroup
                      exclusive
                      orientation="vertical"
                      size="small"
                      aria-label="add cube">
                      <ToggleButton
                        value="add cube"
                        aria-label="add cube"
                        onClick={addCube}>
                        <Tooltip
                          title={"Add a cube to the scene"}
                          placement="right"
                          disableInteractive>
                          <AddRoundedIcon />
                        </Tooltip>
                      </ToggleButton>
                      <ToggleButton
                        value="add marker"
                        aria-label="add marker"
                        onClick={addMarker}>
                        <Tooltip
                          title={"Add a marker to the map"}
                          placement="right"
                          disableInteractive>
                          <AddPhotoAlternateRoundedIcon />
                        </Tooltip>
                      </ToggleButton>
                    </ToggleButtonGroup>
                  ) : (
                    <></>
                  )}
                </Box>
                {mode === "edit" ? (
                  <Chip
                    label={"Edit Mode"}
                    sx={{
                      top: "4px",
                      transform: "translate(-50%, 0%)",
                      left: "50%",
                      zIndex: 9,
                      color: "#7c8186",
                      position: "absolute",
                    }}
                  />
                ) : (
                  <></>
                )}
                <Box
                  position={"absolute"}
                  top={"4px"}
                  right={"4px"}
                  zIndex={99}>
                  {target && mode === "edit" ? (
                    <>
                      <ToggleButtonGroup
                        sx={{mr: "4px"}}
                        exclusive
                        size="small"
                        aria-label="delete">
                        <ToggleButton
                          value="delete-cube"
                          aria-label="delete-cube"
                          onClick={deleteCube}>
                          <Tooltip title={"Delete cube"} disableInteractive>
                            <DeleteRoundedIcon />
                          </Tooltip>
                        </ToggleButton>
                      </ToggleButtonGroup>
                      <ToggleButtonGroup
                        size={"small"}
                        value={cubeEditMode}
                        exclusive
                        onChange={handleCubeEditModeChange}
                        aria-label="cube edit mode">
                        <ToggleButton value="translate" aria-label="translate">
                          <Tooltip title={"Translate"} disableInteractive>
                            <OpenWithRoundedIcon />
                          </Tooltip>
                        </ToggleButton>
                        <ToggleButton value="rotate" aria-label="rotate">
                          <Tooltip title={"Rotate"} disableInteractive>
                            <AutorenewRoundedIcon />
                          </Tooltip>
                        </ToggleButton>
                        <ToggleButton value="scale" aria-label="scale">
                          <Tooltip title={"Scale"} disableInteractive>
                            <AspectRatioRoundedIcon />
                          </Tooltip>
                        </ToggleButton>
                      </ToggleButtonGroup>
                      <CirclePicker
                        onChange={color => {
                          let colorGazebo = hexToGazebo(color.hex);
                          socket.emit("EditCube", {
                            model_id: String(target.oId),
                            position: [
                              target.position.z / 10,
                              target.position.x / 10,
                              (target.position.y + 0.87) / 10,
                            ],
                            rotation: [
                              target.rotation.z,
                              target.rotation.x,
                              target.rotation.y,
                            ],
                            size: [
                              (target.scale.x *
                                target.geometry.parameters.depth) /
                                10,
                              (target.scale.y *
                                target.geometry.parameters.height) /
                                10,
                              (target.scale.z *
                                target.geometry.parameters.width) /
                                10,
                            ],
                            color: colorGazebo,
                            colorHex: color.hex,
                            instanceID: props.instanceID,
                          });
                          cubesGlobal[target.oId].color = color.hex;
                          cubesGlobal[target.oId].position = [
                            target.position.x,
                            target.position.y,
                            target.position.z,
                          ];
                          cubesGlobal[target.oId].rotation = [
                            target.rotation.x,
                            target.rotation.y,
                            target.rotation.z,
                          ];
                          cubesGlobal[target.oId].args = [
                            cubesGlobal[target.oId].args[0] * target.scale.x,
                            cubesGlobal[target.oId].args[1] * target.scale.y,
                            cubesGlobal[target.oId].args[2] * target.scale.z,
                          ];
                          setCubes([
                            ...cubesGlobal.map(cube => (
                              <Cube
                                position={cube.position}
                                rotation={cube.rotation}
                                args={cube.args}
                                color={cube.color}
                                key={cube.oId}
                                oId={cube.oId}
                              />
                            )),
                          ]);
                          setTarget(cubes[target.oId]);
                        }}
                        circleSize={18}
                        circleSpacing={8}
                        colors={[
                          "#0504ff",
                          "#fe0405",
                          "#04ff04",
                          "#838383",
                          "#020202",
                          "#ffffff",
                          "#ffff00",
                          "#ff9a0e",
                          "#ff04ff",
                        ]}
                      />
                    </>
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
                      cubesGlobal[target.oId].position = [
                        target.position.x,
                        target.position.y,
                        target.position.z,
                      ];
                      cubesGlobal[target.oId].rotation = [
                        target.rotation.x,
                        target.rotation.y,
                        target.rotation.z,
                      ];
                      cubesGlobal[target.oId].args = [
                        cubesGlobal[target.oId].args[0] * target.scale.x,
                        cubesGlobal[target.oId].args[1] * target.scale.y,
                        cubesGlobal[target.oId].args[2] * target.scale.z,
                      ];
                      socket.emit("EditCube", {
                        model_id: String(target.oId),
                        position: [
                          target.position.z / 10,
                          target.position.x / 10,
                          (target.position.y + 0.87) / 10,
                        ],
                        rotation: [
                          target.rotation.z,
                          target.rotation.x,
                          target.rotation.y,
                        ],
                        size: [
                          (target.scale.x * target.geometry.parameters.depth) /
                            10,
                          (target.scale.y * target.geometry.parameters.height) /
                            10,
                          (target.scale.z * target.geometry.parameters.width) /
                            10,
                        ],
                        color: hexToGazebo(target.color),
                        colorHex: target.color,
                        instanceID: props.instanceID,
                      });
                    }}
                  />
                )}
                <OrbitControls makeDefault />
              </Suspense>
            </Canvas>
          </Box>
        ) : (
          <Button
            disabled={runGazeboButton}
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
