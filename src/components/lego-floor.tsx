"use client"

import React from 'react'
import * as THREE from 'three'

export function LegoFloor() {
  const FLOOR_SIZE = 32 // 32x32 units
  const UNIT_SIZE = 0.8 // Size of one unit (previously stud spacing)

  const floorGeometry = React.useMemo(() => {
    return new THREE.PlaneGeometry(FLOOR_SIZE * UNIT_SIZE, FLOOR_SIZE * UNIT_SIZE)
  }, [])

  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <mesh geometry={floorGeometry} receiveShadow visible={false}>
        <shadowMaterial transparent opacity={0} />
      </mesh>
    </group>
  )
}