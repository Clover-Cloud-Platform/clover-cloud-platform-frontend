import React, {useRef} from "react";
import {OrbitControls, Sky} from "@react-three/drei";
import {useLoader} from "@react-three/fiber";
import {Canvas} from "@react-three/fiber";
import {TextureLoader} from "three/src/loaders/TextureLoader";
import {RepeatWrapping} from "three";
import CloverBody from "../assets/modelsJSX/CloverBody";
import CloverGuards from "../assets/modelsJSX/CloverGuards";
import PropCW from "../assets/modelsJSX/PropCW";
import PropCCW from "../assets/modelsJSX/PropCCW";
import Box from "@mui/material/Box";
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
  texture.repeat.set(10, 10);
  return (
    <Box height={"100%"} width={"100%"} bgcolor={"background.cloverMain"}>
      <Canvas dpr={[1, 2]} shadows camera={{position: [-3, 0, 0], fov: 90}}>
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
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.87, 0]}
          receiveShadow>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial map={texture} />
        </mesh>
        <OrbitControls />
      </Canvas>
    </Box>
  );
}
