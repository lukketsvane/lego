"use client"

import React, { useMemo } from 'react'
import * as THREE from 'three'

interface LegoBrickProps {
  size: { width: number; length: number }
  color: string
  position: [number, number, number]
  rotation: number
  isSelected?: boolean
  isPreview?: boolean
}

export function LegoBrick({ size, color, position, rotation, isSelected, isPreview }: LegoBrickProps) {
  const { width, length } = size
  
  // LEGO brick dimensions (in LEGO units)
  const UNIT = 0.8 // 1 LEGO unit = 0.8 units in our 3D space
  const PLATE_HEIGHT = 0.32
  const BRICK_HEIGHT = 0.96
  const STUD_HEIGHT = 0.18
  const STUD_RADIUS = 0.24
  const STUD_SPACING = 0.8

  const isFlat = width === 2 && length === 2
  const is1x1 = width === 1 && length === 1
  const brickHeight = isFlat ? PLATE_HEIGHT : BRICK_HEIGHT
  const brickWidth = width * UNIT
  const brickLength = length * UNIT

  const material = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    metalness: 0.1,
    roughness: 0.3,
    clearcoat: 0.8,
    clearcoatRoughness: 0.2,
  }), [color])

  const outlineMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.BackSide,
  }), [])

  const brickGeometry = useMemo(() => {
    if (is1x1) {
      return new THREE.CylinderGeometry(UNIT / 2, UNIT / 2, BRICK_HEIGHT, 16)
    } else {
      return new THREE.BoxGeometry(brickWidth, brickHeight, brickLength)
    }
  }, [is1x1, brickWidth, brickHeight, brickLength])

  const studGeometry = useMemo(() => new THREE.CylinderGeometry(STUD_RADIUS, STUD_RADIUS, STUD_HEIGHT, 16), [])

  // Calculate the offset for correct placement
  const offsetX = rotation % 180 === 0 ? 0 : (length % 2 === 0 ? UNIT / 2 : 0)
  const offsetZ = rotation % 180 === 0 ? (length % 2 === 0 ? UNIT / 2 : 0) : 0

  return (
    <group position={[position[0] + offsetX, position[1], position[2] + offsetZ]} rotation={[0, rotation * Math.PI / 180, 0]}>
      {isSelected && (
        <mesh scale={[1.05, 1.05, 1.05]}>
          <primitive object={brickGeometry} />
          <primitive object={outlineMaterial} attach="material" />
        </mesh>
      )}
      <mesh position={[0, brickHeight / 2, 0]} castShadow receiveShadow>
        <primitive object={brickGeometry} />
        <primitive object={material} attach="material" />
      </mesh>
      {!is1x1 && Array.from({ length: width }, (_, i) =>
        Array.from({ length }, (_, j) => (
          <mesh 
            key={`stud-${i}-${j}`} 
            position={[
              (i - (width - 1) / 2) * STUD_SPACING, 
              brickHeight + STUD_HEIGHT / 2, 
              (j - (length - 1) / 2) * STUD_SPACING
            ]}
            castShadow
          >
            <primitive object={studGeometry} />
            <primitive object={material} attach="material" />
          </mesh>
        ))
      )}
      {is1x1 && (
        <mesh 
          position={[0, brickHeight + STUD_HEIGHT / 2, 0]}
          castShadow
        >
          <primitive object={studGeometry} />
          <primitive object={material} attach="material" />
        </mesh>
      )}
      {isPreview && (
        <mesh geometry={brickGeometry}>
          <meshBasicMaterial color={color} opacity={0.5} transparent />
        </mesh>
      )}
    </group>
  )
}