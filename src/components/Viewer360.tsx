import React, { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'
import { DrawingTool } from '../types'

interface Viewer360Props {
  imageUrl: string
  isDrawing: boolean
  drawingTool: DrawingTool
}

const Viewer360: React.FC<Viewer360Props> = ({ imageUrl, isDrawing, drawingTool }) => {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene>()
  const rendererRef = useRef<THREE.WebGLRenderer>()
  const cameraRef = useRef<THREE.PerspectiveCamera>()
  const sphereRef = useRef<THREE.Mesh>()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isMouseDown, setIsMouseDown] = useState(false)
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!mountRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    mountRef.current.appendChild(renderer.domElement)

    // Create sphere for 360° image
    const geometry = new THREE.SphereGeometry(500, 60, 40)
    geometry.scale(-1, 1, 1) // Invert to see from inside

    const loader = new THREE.TextureLoader()
    const material = new THREE.MeshBasicMaterial()
    
    loader.load(imageUrl, (texture) => {
      material.map = texture
      material.needsUpdate = true
    })

    const sphere = new THREE.Mesh(geometry, material)
    scene.add(sphere)

    // Position camera at center
    camera.position.set(0, 0, 0)

    // Store references
    sceneRef.current = scene
    rendererRef.current = renderer
    cameraRef.current = camera
    sphereRef.current = sphere

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }
    animate()

    // Handle window resize
    const handleResize = () => {
      if (!mountRef.current || !camera || !renderer) return
      
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])

  // Update texture when image changes
  useEffect(() => {
    if (!sphereRef.current) return

    const loader = new THREE.TextureLoader()
    loader.load(imageUrl, (texture) => {
      const material = sphereRef.current!.material as THREE.MeshBasicMaterial
      material.map = texture
      material.needsUpdate = true
    })
  }, [imageUrl])

  // Handle mouse interactions for camera control and drawing
  const handleMouseDown = (event: React.MouseEvent) => {
    setIsMouseDown(true)
    setLastMousePos({ x: event.clientX, y: event.clientY })

    if (isDrawing && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (ctx) {
        const rect = canvas.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top
        
        ctx.strokeStyle = drawingTool.color
        ctx.lineWidth = drawingTool.thickness
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(x, y)
      }
    }
  }

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isMouseDown || !cameraRef.current) return

    const deltaX = event.clientX - lastMousePos.x
    const deltaY = event.clientY - lastMousePos.y

    if (isDrawing && canvasRef.current) {
      // Drawing mode
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (ctx) {
        const rect = canvas.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top
        
        ctx.lineTo(x, y)
        ctx.stroke()
      }
    } else {
      // Camera control mode
      const camera = cameraRef.current
      const spherical = new THREE.Spherical()
      spherical.setFromVector3(camera.position)
      
      spherical.theta -= deltaX * 0.01
      spherical.phi += deltaY * 0.01
      spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi))
      
      camera.position.setFromSpherical(spherical)
      camera.lookAt(0, 0, 0)
    }

    setLastMousePos({ x: event.clientX, y: event.clientY })
  }

  const handleMouseUp = () => {
    setIsMouseDown(false)
  }

  // Setup annotation canvas
  useEffect(() => {
    if (!canvasRef.current || !mountRef.current) return

    const canvas = canvasRef.current
    const container = mountRef.current
    
    canvas.width = container.clientWidth
    canvas.height = container.clientHeight
    
    const handleResize = () => {
      canvas.width = container.clientWidth
      canvas.height = container.clientHeight
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div 
      ref={mountRef} 
      className="viewer-container w-full h-full relative"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: isDrawing ? 'crosshair' : 'grab' }}
    >
      <canvas
        ref={canvasRef}
        className={`annotation-canvas ${isDrawing ? 'drawing' : ''}`}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: isDrawing ? 'all' : 'none',
          zIndex: 10
        }}
      />
    </div>
  )
}

export default Viewer360