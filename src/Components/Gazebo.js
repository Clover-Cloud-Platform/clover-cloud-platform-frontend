import React, {useRef, Suspense, useEffect} from "react";
import {Html, OrbitControls, Sky, useProgress, Svg} from "@react-three/drei";
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
import {CircularProgress} from "@mui/material";
import {theme} from "../App";
import {ThemeProvider} from "@mui/material/styles";

const socket = io(process.env.REACT_APP_SERVER_LINK);

const Clover = () => {
  const group = useRef();
  return (
    <group ref={group} dispose={null}>
      <CloverBody position={[0, 0, 0]} scale={[10, 10, 10]} />
      <CloverGuards position={[0, 0, 0]} scale={[10, 10, 10]} />
      <PropCW position={[-0.826, 0, 0.826]} scale={[10, 10, 10]} />
      <PropCCW position={[0.826, 0, 0.826]} scale={[10, 10, 10]} />
      <PropCW position={[0.826, 0, -0.826]} scale={[10, 10, 10]} />
      <PropCCW position={[-0.826, 0, -0.826]} scale={[10, 10, 10]} />
    </group>
  );
};
const Aruco = props => {
  return (
    <Svg
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

const arucoMarkersGlobal = [];
let arucoMarkersReceived = false;

export default function Gazebo(props) {
  const [gazeboRunning, setGazebo] = React.useState(false);
  const [runGazeboButtonState, disableRunGazebo] = React.useState(true);

  const [arucoMarkers, setArucoMarkers] = React.useState([]);

  socket.emit("GetGazeboState", props.instanceID);
  socket.on("GazeboStateRes", state => {
    if (state) {
      setGazebo(true);
      socket.emit("RunGazebo", props.instanceID);
    } else {
      disableRunGazebo(false);
    }
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

  const Loader = () => {
    const {progress} = useProgress();
    return (
      <Html center>
        <ThemeProvider theme={theme}>
          <Box width={"100%"}>
            <CircularProgress
              variant={"determinate"}
              value={progress}
              color={"primary"}
            />
          </Box>
        </ThemeProvider>
      </Html>
    );
  };

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
          <Canvas
            dpr={[1, 2]}
            shadows
            camera={{position: [-3, 3, 5], fov: 90}}
            performance={{min: 0.5}}>
            <Suspense fallback={<Loader />}>
              <hemisphereLight
                intensity={0.2}
                color="#f5f3ff"
                groundColor="#a78bfa"
              />
              <directionalLight
                castShadow
                shadow-mapSize={[2048, 2048]}
                intensity={0.2}
                position={[-200, 400, -200]}
              />
              <Sky />
              <Clover />
              {arucoMarkers}
              <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, -0.87, 0]}
                receiveShadow>
                <planeGeometry args={[500, 500]} />
                <meshStandardMaterial map={texture} />
              </mesh>
              <OrbitControls />
            </Suspense>
          </Canvas>
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
