"use client"

import React from 'react'
import { Square, Trash2, Shuffle, Palette, RotateCw } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

interface ToolbarProps {
  brickSizes: Array<{ width: number; length: number; key: string }>
  currentBrickType: { width: number; length: number }
  setCurrentBrickType: (type: { width: number; length: number }) => void
  isRandomColorMode: boolean
  setIsRandomColorMode: (mode: boolean) => void
  currentColor: string
  setCurrentColor: (color: string) => void
  legoColors: Array<{ name: string; hex: string }>
  rotation: number
  setRotation: (rotation: number) => void
}

export function Toolbar({ 
  brickSizes,
  currentBrickType, 
  setCurrentBrickType, 
  isRandomColorMode, 
  setIsRandomColorMode,
  currentColor,
  setCurrentColor,
  legoColors,
  rotation,
  setRotation
}: ToolbarProps) {
  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-80 rounded-full shadow-lg p-2 flex items-center space-x-2">
      {brickSizes.map((size, index) => (
        <button
          key={index}
          className={`p-2 rounded-full ${currentBrickType.width === size.width && currentBrickType.length === size.length ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`}
          onClick={() => setCurrentBrickType(size)}
          aria-label={`Select ${size.width}x${size.length} brick (${size.key})`}
        >
          <div className="flex items-center justify-center">
            <Square style={{ width: size.width * 10, height: size.length * 10 }} />
            <span className="ml-1">{size.key}</span>
          </div>
        </button>
      ))}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-10 h-10 p-0">
            <Palette className="h-4 w-4" />
            <span className="sr-only">Open color picker</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="grid grid-cols-5 gap-2">
            {legoColors.map((color) => (
              <button
                key={color.hex}
                className={`w-8 h-8 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-gray-900 ${
                  currentColor === color.hex ? 'ring-2 ring-offset-2 ring-offset-white ring-gray-900' : ''
                }`}
                style={{ backgroundColor: color.hex }}
                onClick={() => setCurrentColor(color.hex)}
                aria-label={`Select ${color.name} color`}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>
      <button
        className={`p-2 rounded-full ${isRandomColorMode ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'}`}
        onClick={() => setIsRandomColorMode(!isRandomColorMode)}
        aria-label="Toggle random color mode (R)"
      >
        <div className="flex items-center justify-center">
          <Shuffle />
          <span className="ml-1">R</span>
        </div>
      </button>
      <button
        className="p-2 rounded-full hover:bg-gray-200"
        onClick={() => setRotation((prev) => (prev + 90) % 360)}
        aria-label="Rotate brick (R)"
      >
        <div className="flex items-center justify-center">
          <RotateCw />
          <span className="ml-1">R</span>
        </div>
      </button>
      <button
        className="p-2 rounded-full hover:bg-gray-200"
        onClick={() => alert('Select a brick and press Backspace or Delete to remove it')}
        aria-label="Delete selected brick (Backspace/Delete)"
      >
        <div className="flex items-center justify-center">
          <Trash2 />
          <span className="ml-1">⌫</span>
        </div>
      </button>
    </div>
  )
}