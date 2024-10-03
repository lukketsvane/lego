"use client"

import React, { useState, useCallback, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, AccumulativeShadows, RandomizedLight, SoftShadows } from '@react-three/drei'
import { BrickPlacer } from './brick-placer'
import { Toolbar } from './toolbar'
import { LegoFloor } from './lego-floor'

const brickSizes = [
  { width: 1, length: 1, key: '1' },
  { width: 1, length: 2, key: '2' },
  { width: 1, length: 3, key: '3' },
  { width: 1, length: 4, key: '4' },
  { width: 2, length: 2, key: '5' },
  { width: 2, length: 3, key: '6' },
  { width: 2, length: 4, key: '7' },
  { width: 2, length: 6, key: '8' },
  { width: 2, length: 8, key: '9' },
]

const legoColors = [
  { name: 'Red', hex: '#FF0000' },
  { name: 'Blue', hex: '#0000FF' },
  { name: 'Yellow', hex: '#FFFF00' },
  { name: 'Green', hex: '#008000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Black', hex: '#000000' },
  { name: 'Orange', hex: '#FFA500' },
  { name: 'Brown', hex: '#8B4513' },
  { name: 'Light Gray', hex: '#D3D3D3' },
  { name: 'Dark Gray', hex: '#A9A9A9' },
]

export default function AdvancedLegoBuilder() {
  const [currentBrickType, setCurrentBrickType] = useState(brickSizes[0])
  const [isRandomColorMode, setIsRandomColorMode] = useState(false)
  const [currentColor, setCurrentColor] = useState(legoColors[0].hex)
  const [rotation, setRotation] = useState(0)
  const orbitControlsRef = useRef<React.ComponentRef<typeof OrbitControls>>(null)

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    const key = event.key
    if (key >= '1' && key <= '9') {
      const index = parseInt(key) - 1
      if (index < brickSizes.length) {
        setCurrentBrickType(brickSizes[index])
      }
    } else if (key === 'r' || key === 'R') {
      setRotation((prev) => (prev + 90) % 360)
    }
  }, [])

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [handleKeyPress])

  const handleSetCurrentBrickType = (type: { width: number; length: number }) => {
    const newBrickType = brickSizes.find(size => size.width === type.width && size.length === type.length) || brickSizes[0]
    setCurrentBrickType(newBrickType)
  }

  return (
    <div className="w-full h-screen bg-gray-100 relative">
      <Canvas shadows camera={{ position: [20, 20, 20], fov: 50 }}>
        <SoftShadows size={2.5} samples={16} focus={0.5} />
        <color attach="background" args={['#f0f0f0']} />
        <fog attach="fog" args={['#f0f0f0', 30, 100]} />
        <ambientLight intensity={0.5} />
        <directionalLight
          castShadow
          position={[2.5, 8, 5]}
          intensity={1.5}
          shadow-mapSize={1024}
        >
          <orthographicCamera attach="shadow-camera" args={[-10, 10, -10, 10, 0.1, 50]} />
        </directionalLight>
        <pointLight position={[-10, 0, -20]} color="white" intensity={1} />
        <pointLight position={[0, -10, 0]} intensity={0.5} />
        <BrickPlacer 
          brickSizes={brickSizes}
          currentBrickType={currentBrickType}
          isRandomColorMode={isRandomColorMode}
          currentColor={currentColor}
          rotation={rotation}
        />
        <LegoFloor />
        <OrbitControls 
          ref={orbitControlsRef}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 3}
          enableRotate={false}
          enablePan={false}
          zoomSpeed={0.5}
          mouseButtons={{
            RIGHT: 2, // Enable orbit with right mouse button
          }}
          onEnd={() => {
            // Snap to nearest 90-degree rotation
            if (orbitControlsRef.current) {
              const rotation = orbitControlsRef.current.getAzimuthalAngle()
              const snappedRotation = Math.round(rotation / (Math.PI / 2)) * (Math.PI / 2)
              orbitControlsRef.current.setAzimuthalAngle(snappedRotation)
            }
          }}
        />
        <AccumulativeShadows temporal frames={100} color="#9d4b4b" colorBlend={0.5} alphaTest={0.9} scale={20}>
          <RandomizedLight amount={8} radius={4} position={[5, 5, -10]} />
        </AccumulativeShadows>
        <Environment preset="city" />
      </Canvas>
      <Toolbar 
        brickSizes={brickSizes}
        currentBrickType={currentBrickType} 
        setCurrentBrickType={handleSetCurrentBrickType}
        isRandomColorMode={isRandomColorMode}
        setIsRandomColorMode={setIsRandomColorMode}
        currentColor={currentColor}
        setCurrentColor={setCurrentColor}
        legoColors={legoColors}
        rotation={rotation}
        setRotation={setRotation}
      />
    </div>
  )
}