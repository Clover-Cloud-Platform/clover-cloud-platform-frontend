import React, {useRef} from "react";
import {OrbitControls} from "@react-three/drei";
import {useLoader} from "@react-three/fiber";
import {Canvas} from "@react-three/fiber";
import Box from "@mui/material/Box";
import {TextureLoader} from "three/src/loaders/TextureLoader";
import {RepeatWrapping} from "three";
import CloverBody from "../assets/modelsJSX/CloverBody";
import CloverGuards from "../assets/modelsJSX/CloverGuards";
import PropCW from "../assets/modelsJSX/PropCW";
import PropCCW from "../assets/modelsJSX/PropCCW";
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

export default function Gazebo() {
  const texture = useLoader(TextureLoader, "/models/floor.jpg");
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(50, 50);
  return (
    <Box
      sx={{
        position: "absolute",
        left: 10,
        right: 10,
        top: 25,
        bottom: 10,
      }}>
      <Canvas dpr={[1, 2]} shadows camera={{position: [-30, 0, 0], fov: 90}}>
        <hemisphereLight
          intensity={0.2}
          color="#f5f3ff"
          groundColor="#a78bfa"
        />
        <directionalLight
          castShadow
          shadow-mapSize={[2048, 2048]}
          intensity={0.2}
          position={[10, 200, -100]}
        />
        <Clover />
        <mesh position={[0, -0.92, 0]} receiveShadow>
          <boxGeometry args={[500, 0.1, 500]} />
          <meshStandardMaterial map={texture} repeat={400} />
        </mesh>
        <OrbitControls />
      </Canvas>
    </Box>
  );
}
