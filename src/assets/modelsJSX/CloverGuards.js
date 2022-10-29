/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/

import React, {useRef} from "react";
import {useGLTF} from "@react-three/drei";

export default function CloverGuards(props) {
  const {nodes, materials} = useGLTF("/models/clover_guards.glb");
  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Transparent_parts.geometry}
        material={materials["!_Transparent (Polycarbonate+LED).001"]}
        position={[0, -0.01, 0]}
        rotation={[Math.PI / 2, 0, -Math.PI / 2]}
      />
    </group>
  );
}

useGLTF.preload("/clover_guards.glb");