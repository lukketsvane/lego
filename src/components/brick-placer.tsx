"use client"

import React, { useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { useThree, useFrame } from '@react-three/fiber'
import { LegoBrick } from './lego-brick'
import { LegoFloor } from './lego-floor'

interface BrickPlacerProps {
  brickSizes: Array<{ width: number; length: number; key: string }>
  currentBrickType: { width: number; length: number }
  isRandomColorMode: boolean
  currentColor: string
  rotation: number
  isSelectMode: boolean
}

export function BrickPlacer({ brickSizes, currentBrickType, isRandomColorMode, currentColor, rotation, isSelectMode }: BrickPlacerProps) {
  const [bricks, setBricks] = useState<Array<{ id: number; size: { width: number; length: number }; color: string; position: [number, number, number]; rotation: number }>>([])
  const [previewBrick, setPreviewBrick] = useState<{ size: { width: number; length: number }; position: [number, number, number]; rotation: number } | null>(null)
  const [selectedBrick, setSelectedBrick] = useState<number | null>(null)
  const { camera, scene } = useThree()
  const raycaster = useRef(new THREE.Raycaster())
  const mouse = useRef(new THREE.Vector2())

  const GRID_SIZE = 0.8
  const BRICK_HEIGHT = 0.96
  const PLATE_HEIGHT = 0.32
  const EPSILON = 0.0001

  const isPositionOccupied = useCallback((position: [number, number, number], size: { width: number; length: number }, rotation: number, excludeId?: number) => {
    const rotatedSize = rotation % 180 === 0 ? size : { width: size.length, length: size.width }

    return bricks.some(brick => {
      if (brick.id === excludeId) return false
      const brickRotatedSize = brick.rotation % 180 === 0 ? brick.size : { width: brick.size.length, length: brick.size.width }
      
      const xOverlap = Math.abs(brick.position[0] - position[0]) < (brickRotatedSize.width + rotatedSize.width) * GRID_SIZE / 2 - EPSILON
      const zOverlap = Math.abs(brick.position[2] - position[2]) < (brickRotatedSize.length + rotatedSize.length) * GRID_SIZE / 2 - EPSILON
      const yOverlap = Math.abs(brick.position[1] - position[1]) < ((brick.size.width === 2 && brick.size.length === 2) ? PLATE_HEIGHT : BRICK_HEIGHT) - EPSILON

      return xOverlap && zOverlap && yOverlap
    })
  }, [bricks])

  const is2x1Adjacent = useCallback((position: [number, number, number], rotation: number) => {
    if (currentBrickType.width !== 2 || currentBrickType.length !== 1) return false

    return bricks.some(brick => {
      if (brick.size.width !== 2 || brick.size.length !== 1) return false

      const isHorizontal = rotation % 180 === 0
      const brickIsHorizontal = brick.rotation % 180 === 

 0

      if (isHorizontal !== brickIsHorizontal) return false

      const xDiff = Math.abs(brick.position[0] - position[0])
      const zDiff = Math.abs(brick.position[2] - position[2])

      return (isHorizontal && xDiff === GRID_SIZE * 2 && zDiff < EPSILON) ||
             (!isHorizontal && zDiff === GRID_SIZE * 2 && xDiff < EPSILON)
    })
  }, [bricks, currentBrickType])

  const snapToGrid = useCallback((position: THREE.Vector3, size: { width: number; length: number }, rotation: number): [number, number, number] => {
    const rotatedSize = rotation % 180 === 0 ? size : { width: size.length, length: size.width }
    const halfWidth = (rotatedSize.width * GRID_SIZE) / 2
    const halfLength = (rotatedSize.length * GRID_SIZE) / 2

    let snappedX = Math.round(position.x / (GRID_SIZE / 2)) * (GRID_SIZE / 2)
    let snappedZ = Math.round(position.z / (GRID_SIZE / 2)) * (GRID_SIZE / 2)
    let snappedY = 0

    // Adjust position to align with grid
    snappedX = Math.round(snappedX / (GRID_SIZE * rotatedSize.width)) * (GRID_SIZE * rotatedSize.width)
    snappedZ = Math.round(snappedZ / (GRID_SIZE * rotatedSize.length)) * (GRID_SIZE * rotatedSize.length)

    // Find the highest brick below the current position
    const highestBrick = bricks.reduce((highest, brick) => {
      const brickTop = brick.position[1] + ((brick.size.width === 2 && brick.size.length === 2) ? PLATE_HEIGHT : BRICK_HEIGHT)
      if (brickTop > highest && 
          Math.abs(brick.position[0] - snappedX) < (brick.size.width * GRID_SIZE) / 2 + halfWidth &&
          Math.abs(brick.position[2] - snappedZ) < (brick.size.length * GRID_SIZE) / 2 + halfLength) {
        return brickTop
      }
      return highest
    }, 0)

    snappedY = highestBrick

    return [snappedX, snappedY, snappedZ]
  }, [bricks])

  const getRandomColor = useCallback(() => {
    return `#${Math.floor(Math.random()*16777215).toString(16)}`
  }, [])

  const updatePreviewBrick = useCallback((event: MouseEvent) => {
    if (isSelectMode) {
      setPreviewBrick(null)
      return
    }

    mouse.current.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    )

    raycaster.current.setFromCamera(mouse.current, camera)
    const intersects = raycaster.current.intersectObjects(scene.children, true)

    if (intersects.length > 0) {
      const intersect = intersects[0]
      const size = currentBrickType
      const snappedPosition = snapToGrid(intersect.point, size, rotation)

      const isOccupied = isPositionOccupied(snappedPosition, size, rotation)
      const isAdjacent2x1 = is2x1Adjacent(snappedPosition, rotation)
      
      if (!isOccupied && !isAdjacent2x1) {
        setPreviewBrick({
          size: size,
          position: snappedPosition,
          rotation: rotation
        })
      } else {
        setPreviewBrick(null)
      }
    } else {
      setPreviewBrick(null)
    }
  }, [camera, scene, isPositionOccupied, currentBrickType, snapToGrid, rotation, is2x1Adjacent, isSelectMode])

  const placeBrick = useCallback(() => {
    if (previewBrick) {
      const color = isRandomColorMode ? getRandomColor() : currentColor
      setBricks(prevBricks => [...prevBricks, { ...previewBrick, id: Date.now(), color }])
      setPreviewBrick(null)
    }
  }, [previewBrick, isRandomColorMode, currentColor, getRandomColor])

  const selectBrick = useCallback((event: MouseEvent) => {
    mouse.current.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    )

    raycaster.current.setFromCamera(mouse.current, camera)
    const intersects = raycaster.current.intersectObjects(scene.children, true)

    if (intersects.length > 0) {
      const clickedBrick = bricks.find(brick => 
        Math.abs(brick.position[0] - intersects[0].point.x) < brick.size.width * GRID_SIZE / 2 &&
        Math.abs(brick.position[2] - intersects[0].point.z) < brick.size.length * GRID_SIZE / 2 &&
        Math.abs(brick.position[1] - intersects[0].point.y) < ((brick.size.width === 2 && brick.size.length === 2) ? PLATE_HEIGHT : BRICK_HEIGHT)
      )
      setSelectedBrick(clickedBrick ? clickedBrick.id : null)
    } else {
      setSelectedBrick(null)
    }
  }, [bricks, camera])

  const deleteBrick = useCallback(() => {
    if (selectedBrick !== null) {
      setBricks(prevBricks => prevBricks.filter(brick => brick.id !== selectedBrick))
      setSelectedBrick(null)
    }
  }, [selectedBrick])

  useFrame(() => {
    document.body.style.cursor = isSelectMode ? 'default' : (previewBrick ? 'pointer' : 'default')
  })

  const handleClick = useCallback((event: MouseEvent) => {
    if (isSelectMode) {
      selectBrick(event)
    } else if (selectedBrick === null) {
      placeBrick()
    } else {
      setSelectedBrick(null)
    }
  }, [isSelectMode, selectBrick, selectedBrick, placeBrick])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if ((event.key === 'Backspace' || event.key === 'Delete') && selectedBrick !== null) {
      deleteBrick()
    }
  }, [deleteBrick, selectedBrick])

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  return (
    <group 
      onPointerMove={updatePreviewBrick as any} 
      onClick={handleClick as any}
      tabIndex={0}
    >
      <LegoFloor />
      {bricks.map((brick) => (
        <LegoBrick 
          key={brick.id} 
          size={brick.size} 
          color={brick.color} 
          position={brick.position} 
          rotation={brick.rotation}
          isSelected={brick.id === selectedBrick}
        />
      ))}
      {previewBrick && !isSelectMode && (
        <LegoBrick 
          size={previewBrick.size} 
          color="rgba(255, 255, 255, 0.5)"
          position={previewBrick.position} 
          rotation={previewBrick.rotation}
          isPreview={true}
        />
      )}
    </group>
  )
}