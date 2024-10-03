"use client"

import React, { useMemo } from 'react'
import * as THREE from 'three'

export function LegoFloor() {
  const FLOOR_SIZE = 32 // 32x32 units
  const UNIT_SIZE = 0.8 // Size of one unit (previously stud spacing)
  const FLOOR_HEIGHT = 0.32

  const floorGeometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(FLOOR_SIZE * UNIT_SIZE, FLOOR_SIZE * UNIT_SIZE)
    geo.rotateX(-Math.PI / 2)
    return geo
  }, [])

  const floorMaterial = useMemo(() => {
    return new THREE.ShadowMaterial({
      opacity: 0.2 // Slightly visible shadow
    })
  }, [])

  return (
    <group position={[0, -FLOOR_HEIGHT / 2, 0]}>
      <mesh 
        geometry={floorGeometry} 
        material={floorMaterial} 
        receiveShadow
      />
    </group>
  )
}