"use client"

import React, { useMemo } from 'react'
import * as THREE from 'three'

export function LegoFloor() {
  const FLOOR_SIZE = 32 // 32x32 studs
  const STUD_SPACING = 0.8
  const STUD_RADIUS = 0.24
  const STUD_HEIGHT = 0.04
  const FLOOR_HEIGHT = 0.32
  const FLOOR_COLOR = '#4CAF50' // Classic LEGO baseplate green

  const floorGeometry = useMemo(() => {
    const geo = new THREE.BoxGeometry(FLOOR_SIZE * STUD_SPACING, FLOOR_HEIGHT, FLOOR_SIZE * STUD_SPACING)
    geo.translate(0, -FLOOR_HEIGHT / 2, 0)
    return geo
  }, [])

  const floorMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: FLOOR_COLOR,
      roughness: 0.8,
      metalness: 0.2,
    })
  }, [])

  const studGeometry = useMemo(() => new THREE.CylinderGeometry(STUD_RADIUS, STUD_RADIUS, STUD_HEIGHT, 16), [])
  const studMaterial = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: FLOOR_COLOR, 
    roughness: 0.7, 
    metalness: 0.1 
  }), [])

  const studs = useMemo(() => {
    const studsArray = []
    const halfSize = (FLOOR_SIZE * STUD_SPACING) / 2 - (STUD_SPACING / 2)

    for (let i = 0; i < FLOOR_SIZE; i++) {
      for (let j = 0; j < FLOOR_SIZE; j++) {
        studsArray.push(
          <mesh
            key={`stud-${i}-${j}`}
            position={[
              -halfSize + i * STUD_SPACING,
              STUD_HEIGHT / 2,
              -halfSize + j * STUD_SPACING
            ]}
            geometry={studGeometry}
            material={studMaterial}
            receiveShadow
            castShadow
          />
        )
      }
    }
    return studsArray
  }, [studGeometry, studMaterial])

  return (
    <group position={[0, 0, 0]}>
      <mesh geometry={floorGeometry} material={floorMaterial} receiveShadow>
        <meshStandardMaterial color={FLOOR_COLOR} />
      </mesh>
      {studs}
    </group>
  )
}