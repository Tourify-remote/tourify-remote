import React, { useState, useRef, useCallback } from 'react'
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Phone, 
  Upload,
  Palette,
  Eraser,
  Circle,
  ArrowRight,
  FileText
} from 'lucide-react'
import { Tour, DrawingTool } from '../types'
import Viewer360 from './Viewer360'

interface LiveSessionProps {
  tour: Tour
  onEndSession: () => void
}

const LiveSession: React.FC<LiveSessionProps> = ({ tour, onEndSession }) => {
  const [isMicOn, setIsMicOn] = useState(true)
  const [isCameraOn, setIsCameraOn] = useState(true)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentTool, setCurrentTool] = useState<DrawingTool>({
    type: 'pen',
    color: '#ff0000',
    thickness: 3
  })
  const [panoramaImage, setPanoramaImage] = useState<string>('/api/placeholder/2048/1024')
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPanoramaImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const handleEndSession = useCallback(() => {
    // Here we would normally capture the annotated image and generate a report
    // For now, we'll just end the session
    onEndSession()
  }, [onEndSession])

  return (
    <div className="flex h-full bg-gray-900">
      {/* Main Viewer Area */}
      <div className="flex-1 relative">
        <Viewer360 
          imageUrl={panoramaImage}
          isDrawing={isDrawing}
          drawingTool={currentTool}
        />
        
        {/* Upload Button Overlay */}
        <div className="absolute top-4 left-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center px-3 py-2 bg-metro-blue text-white rounded-md hover:bg-metro-light-blue"
          >
            <Upload size={16} className="mr-2" />
            Subir Imagen 360°
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {/* Site Info Overlay */}
        <div className="absolute top-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded-lg">
          <h3 className="font-semibold">{tour.name}</h3>
          <p className="text-sm opacity-75">
            {tour.type === 'station' ? 'Estación' : 
             tour.type === 'workshop' ? 'Taller' : 'Túnel'}
          </p>
        </div>
      </div>

      {/* Control Panel */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        {/* Video Call Section */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold mb-3">Comunicación</h3>
          
          {/* Video Feeds */}
          <div className="space-y-3 mb-4">
            <div className="relative bg-gray-800 rounded-lg h-24 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center text-white text-sm">
                Experto (Tú)
              </div>
              {!isCameraOn && (
                <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
                  <VideoOff size={20} className="text-white" />
                </div>
              )}
            </div>
            
            <div className="relative bg-gray-800 rounded-lg h-24 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center text-white text-sm">
                Técnico en Campo
              </div>
            </div>
          </div>

          {/* Call Controls */}
          <div className="flex justify-center space-x-2">
            <button
              onClick={() => setIsMicOn(!isMicOn)}
              className={`p-2 rounded-full ${isMicOn ? 'bg-gray-200' : 'bg-red-500 text-white'}`}
            >
              {isMicOn ? <Mic size={16} /> : <MicOff size={16} />}
            </button>
            <button
              onClick={() => setIsCameraOn(!isCameraOn)}
              className={`p-2 rounded-full ${isCameraOn ? 'bg-gray-200' : 'bg-red-500 text-white'}`}
            >
              {isCameraOn ? <Video size={16} /> : <VideoOff size={16} />}
            </button>
            <button
              onClick={handleEndSession}
              className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600"
            >
              <Phone size={16} />
            </button>
          </div>
        </div>

        {/* Drawing Tools */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold mb-3">Herramientas de Anotación</h3>
          
          {/* Mode Toggle */}
          <div className="flex mb-3">
            <button
              onClick={() => setIsDrawing(false)}
              className={`flex-1 py-2 px-3 text-sm rounded-l-md border ${
                !isDrawing ? 'bg-metro-blue text-white' : 'bg-gray-100'
              }`}
            >
              Navegar
            </button>
            <button
              onClick={() => setIsDrawing(true)}
              className={`flex-1 py-2 px-3 text-sm rounded-r-md border ${
                isDrawing ? 'bg-metro-blue text-white' : 'bg-gray-100'
              }`}
            >
              Dibujar
            </button>
          </div>

          {isDrawing && (
            <div className="space-y-3">
              {/* Tool Selection */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentTool({...currentTool, type: 'pen'})}
                  className={`p-2 rounded ${currentTool.type === 'pen' ? 'bg-metro-blue text-white' : 'bg-gray-100'}`}
                >
                  <Palette size={16} />
                </button>
                <button
                  onClick={() => setCurrentTool({...currentTool, type: 'circle'})}
                  className={`p-2 rounded ${currentTool.type === 'circle' ? 'bg-metro-blue text-white' : 'bg-gray-100'}`}
                >
                  <Circle size={16} />
                </button>
                <button
                  onClick={() => setCurrentTool({...currentTool, type: 'arrow'})}
                  className={`p-2 rounded ${currentTool.type === 'arrow' ? 'bg-metro-blue text-white' : 'bg-gray-100'}`}
                >
                  <ArrowRight size={16} />
                </button>
                <button className="p-2 rounded bg-gray-100 hover:bg-gray-200">
                  <Eraser size={16} />
                </button>
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-sm font-medium mb-1">Color</label>
                <input
                  type="color"
                  value={currentTool.color}
                  onChange={(e) => setCurrentTool({...currentTool, color: e.target.value})}
                  className="w-full h-8 rounded border"
                />
              </div>

              {/* Thickness */}
              <div>
                <label className="block text-sm font-medium mb-1">Grosor</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={currentTool.thickness}
                  onChange={(e) => setCurrentTool({...currentTool, thickness: parseInt(e.target.value)})}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Session Actions */}
        <div className="p-4 mt-auto">
          <button
            onClick={handleEndSession}
            className="w-full flex items-center justify-center px-4 py-3 bg-metro-orange text-white rounded-md hover:bg-orange-600 font-medium"
          >
            <FileText size={16} className="mr-2" />
            Finalizar y Reportar
          </button>
        </div>
      </div>
    </div>
  )
}

export default LiveSession