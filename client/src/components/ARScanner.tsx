import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useCamera } from '@/hooks/useCamera';
import { useARScanning, ARScanningUtils, DetectedCard } from '@/hooks/useARScanning';
import { useHeroes } from '@/lib/stores/useHeroes';
import { useIsMobile } from '@/hooks/use-is-mobile';
import {
  Camera,
  X,
  RotateCcw,
  Zap,
  ZapOff,
  Settings,
  Target,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Scan,
  Eye,
  EyeOff
} from 'lucide-react';

interface ARScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onHeroDetected?: (heroId: string) => void;
}

export default function ARScanner({ isOpen, onClose, onHeroDetected }: ARScannerProps) {
  const isMobile = useIsMobile();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout>();
  const [showSettings, setShowSettings] = useState(false);
  const [detectionActive, setDetectionActive] = useState(true);

  // Camera hook
  const {
    stream,
    isLoading: cameraLoading,
    error: cameraError,
    isSupported,
    permissions,
    videoRef,
    startCamera,
    stopCamera,
    switchCamera,
    capturePhoto,
    getVideoDimensions
  } = useCamera({
    video: {
      width: { ideal: 1280, max: 1920 },
      height: { ideal: 720, max: 1080 },
      facingMode: 'environment',
      aspectRatio: 16/9
    },
    audio: false
  });

  // AR scanning hook
  const {
    isScanning,
    isPaused,
    scanMode,
    detectedCards,
    currentDetection,
    scanResults,
    showOverlay,
    targetArea,
    detectionSensitivity,
    minConfidence,
    isProcessing,
    error: scanningError,
    startScanning,
    stopScanning,
    pauseScanning,
    resumeScanning,
    setScanMode,
    addDetectedCard,
    processDetection,
    clearDetections,
    updateSettings,
    setShowOverlay,
    setError: setScanningError
  } = useARScanning();

  const { heroes, selectHero } = useHeroes();

  // Initialize scanning when component opens
  useEffect(() => {
    if (isOpen && stream && !isScanning) {
      startScanning();
    } else if (!isOpen && isScanning) {
      stopScanning();
    }
  }, [isOpen, stream, isScanning, startScanning, stopScanning]);

  // Start camera when component opens
  useEffect(() => {
    if (isOpen && !stream && isSupported) {
      startCamera();
    }
  }, [isOpen, stream, isSupported, startCamera]);

  // Cleanup when component closes
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    }
  }, [isOpen, stopCamera]);

  // Card detection logic
  const detectCards = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !detectionActive || isPaused) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx || video.videoWidth === 0 || video.videoHeight === 0) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Get image data for processing
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Simple edge detection for card-like rectangles
    const detectedRects = detectRectangles(imageData, {
      minWidth: canvas.width * 0.2,
      minHeight: canvas.height * 0.15,
      maxWidth: canvas.width * 0.8,
      maxHeight: canvas.height * 0.6,
      sensitivity: detectionSensitivity
    });
    
    // Convert to DetectedCard objects
    detectedRects.forEach((rect, index) => {
      const card: DetectedCard = {
        id: `card_${Date.now()}_${index}`,
        boundingBox: {
          x: rect.x / canvas.width,
          y: rect.y / canvas.height,
          width: rect.width / canvas.width,
          height: rect.height / canvas.height
        },
        confidence: rect.confidence,
        timestamp: Date.now()
      };
      
      addDetectedCard(card);
    });
  }, [videoRef, detectionActive, isPaused, detectionSensitivity, addDetectedCard]);

  // Start detection interval
  useEffect(() => {
    if (isScanning && !isPaused && detectionActive && stream) {
      detectionIntervalRef.current = setInterval(detectCards, 200); // 5 FPS detection
    } else if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
    
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [isScanning, isPaused, detectionActive, stream, detectCards]);

  // Handle manual scan
  const handleManualScan = useCallback(async () => {
    if (!currentDetection) return;
    
    const capturedImage = capturePhoto();
    const result = await processDetection(currentDetection, capturedImage || undefined);
    
    if (result?.heroId && onHeroDetected) {
      onHeroDetected(result.heroId);
    }
  }, [currentDetection, capturePhoto, processDetection, onHeroDetected]);

  // Handle auto processing result
  useEffect(() => {
    if (scanResults.length > 0) {
      const latestResult = scanResults[scanResults.length - 1];
      if (!latestResult.processed && latestResult.heroId && onHeroDetected) {
        onHeroDetected(latestResult.heroId);
      }
    }
  }, [scanResults, onHeroDetected]);

  // Render scanning overlay
  const renderOverlay = () => {
    if (!showOverlay || !videoRef.current) return null;

    const videoDimensions = getVideoDimensions();
    if (!videoDimensions) return null;

    const overlayStyle = {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none' as const
    };

    return (
      <div style={overlayStyle}>
        {/* Target area */}
        <div
          className="absolute border-2 border-green-400 rounded-lg shadow-lg"
          style={{
            left: `${targetArea.x * 100}%`,
            top: `${targetArea.y * 100}%`,
            width: `${targetArea.width * 100}%`,
            height: `${targetArea.height * 100}%`,
            boxShadow: 'inset 0 0 0 2px rgba(34, 197, 94, 0.3)',
          }}
        >
          {/* Corner indicators */}
          <div className="absolute -top-2 -left-2 w-4 h-4 border-l-2 border-t-2 border-green-400 rounded-tl-lg" />
          <div className="absolute -top-2 -right-2 w-4 h-4 border-r-2 border-t-2 border-green-400 rounded-tr-lg" />
          <div className="absolute -bottom-2 -left-2 w-4 h-4 border-l-2 border-b-2 border-green-400 rounded-bl-lg" />
          <div className="absolute -bottom-2 -right-2 w-4 h-4 border-r-2 border-b-2 border-green-400 rounded-br-lg" />
          
          {/* Center crosshair */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Target className="w-6 h-6 text-green-400 opacity-60" />
          </div>
        </div>

        {/* Detected cards overlay */}
        {detectedCards.slice(-3).map((card, index) => {
          const style = {
            left: `${card.boundingBox.x * 100}%`,
            top: `${card.boundingBox.y * 100}%`,
            width: `${card.boundingBox.width * 100}%`,
            height: `${card.boundingBox.height * 100}%`,
          };

          const isCurrentDetection = currentDetection && card.id === currentDetection.id;
          const quality = ARScanningUtils.calculateQuality(card, targetArea);

          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`absolute border-2 rounded ${
                isCurrentDetection 
                  ? 'border-yellow-400 bg-yellow-400/10' 
                  : 'border-blue-400 bg-blue-400/10'
              }`}
              style={style}
            >
              <Badge 
                className={`absolute -top-2 left-0 text-xs ${
                  isCurrentDetection ? 'bg-yellow-400 text-black' : 'bg-blue-400 text-white'
                }`}
              >
                {Math.round(card.confidence * 100)}%
              </Badge>
              {quality > 0.8 && (
                <CheckCircle className="absolute top-1 right-1 w-4 h-4 text-green-400" />
              )}
            </motion.div>
          );
        })}

        {/* Processing indicator */}
        {isProcessing && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-sm rounded-full p-4">
            <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
          </div>
        )}

        {/* Status indicators */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {isScanning && (
            <Badge className="bg-green-500/80 text-white">
              <Scan className="w-3 h-3 mr-1" />
              Scanning
            </Badge>
          )}
          {isPaused && (
            <Badge className="bg-yellow-500/80 text-black">
              Paused
            </Badge>
          )}
          {scanResults.filter(r => !r.processed && r.heroId).length > 0 && (
            <Badge className="bg-blue-500/80 text-white">
              {scanResults.filter(r => !r.processed && r.heroId).length} Heroes Found
            </Badge>
          )}
        </div>
      </div>
    );
  };

  // Don't render if not supported
  if (!isSupported) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <Card className="bg-black/60 border-red-500/30 backdrop-blur-sm max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Camera Not Supported</h3>
            <p className="text-gray-300 mb-4">
              Your device or browser doesn't support camera access for AR scanning.
            </p>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black"
          style={{ height: '100vh', width: '100vw' }}
        >
          {/* Camera View */}
          <div className="relative w-full h-full">
            {/* Video Element */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ 
                transform: isMobile ? 'scaleX(-1)' : 'none' // Mirror on mobile for better UX
              }}
            />

            {/* Hidden canvas for image processing */}
            <canvas
              ref={canvasRef}
              className="hidden"
            />

            {/* Overlay */}
            {renderOverlay()}

            {/* Error Display */}
            {(cameraError || scanningError) && (
              <div className="absolute top-20 left-4 right-4">
                <Card className="bg-red-900/80 border-red-500/50 backdrop-blur-sm">
                  <CardContent className="p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <div className="text-sm text-white">
                      {cameraError?.message || scanningError}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Loading State */}
            {cameraLoading && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                <Card className="bg-black/60 border-green-500/30 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <Loader2 className="w-12 h-12 text-green-400 mx-auto mb-4 animate-spin" />
                    <h3 className="text-xl font-bold text-white mb-2">Initializing Camera</h3>
                    <p className="text-gray-300">Please allow camera access</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex items-center justify-between max-w-md mx-auto">
                {/* Close Button */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onClose}
                  className="bg-black/60 border-gray-500/30 hover:bg-black/80"
                >
                  <X className="w-5 h-5 text-white" />
                </Button>

                {/* Center Controls */}
                <div className="flex items-center gap-3">
                  {/* Manual Scan Button (when in manual mode or good detection) */}
                  {(scanMode === 'manual' || (currentDetection && ARScanningUtils.calculateQuality(currentDetection, targetArea) > 0.7)) && (
                    <Button
                      size="lg"
                      onClick={handleManualScan}
                      disabled={!currentDetection || isProcessing}
                      className="bg-green-600 hover:bg-green-500 text-white rounded-full p-4"
                    >
                      {isProcessing ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <Camera className="w-6 h-6" />
                      )}
                    </Button>
                  )}

                  {/* Pause/Resume */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={isPaused ? resumeScanning : pauseScanning}
                    className="bg-black/60 border-gray-500/30 hover:bg-black/80"
                  >
                    {isPaused ? <Zap className="w-5 h-5 text-green-400" /> : <ZapOff className="w-5 h-5 text-yellow-400" />}
                  </Button>
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-2">
                  {/* Switch Camera */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={switchCamera}
                    className="bg-black/60 border-gray-500/30 hover:bg-black/80"
                  >
                    <RotateCcw className="w-5 h-5 text-white" />
                  </Button>

                  {/* Toggle Overlay */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowOverlay(!showOverlay)}
                    className="bg-black/60 border-gray-500/30 hover:bg-black/80"
                  >
                    {showOverlay ? <Eye className="w-5 h-5 text-green-400" /> : <EyeOff className="w-5 h-5 text-gray-400" />}
                  </Button>
                </div>
              </div>
            </div>

            {/* Status Bar */}
            <div className="absolute top-4 right-4">
              <div className="flex flex-col gap-2">
                {currentDetection && (
                  <Card className="bg-black/60 border-green-500/30 backdrop-blur-sm">
                    <CardContent className="p-2">
                      <div className="text-xs text-green-400 font-medium">
                        Card Detected: {Math.round(currentDetection.confidence * 100)}%
                      </div>
                      <div className="text-xs text-gray-300">
                        Quality: {Math.round(ARScanningUtils.calculateQuality(currentDetection, targetArea) * 100)}%
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {scanResults.filter(r => r.heroId && !r.processed).length > 0 && (
                  <Card className="bg-blue-900/60 border-blue-500/30 backdrop-blur-sm">
                    <CardContent className="p-2">
                      <div className="text-xs text-blue-400 font-medium">
                        Heroes Found: {scanResults.filter(r => r.heroId && !r.processed).length}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Simple rectangle detection algorithm
function detectRectangles(
  imageData: ImageData, 
  options: {
    minWidth: number;
    minHeight: number;
    maxWidth: number;
    maxHeight: number;
    sensitivity: number;
  }
): Array<{ x: number; y: number; width: number; height: number; confidence: number }> {
  const { data, width, height } = imageData;
  const { minWidth, minHeight, maxWidth, maxHeight, sensitivity } = options;
  const detectedRects: Array<{ x: number; y: number; width: number; height: number; confidence: number }> = [];

  // Simple edge detection and rectangle finding
  // This is a simplified implementation - in production you'd use more sophisticated computer vision
  
  const edgeThreshold = 255 * (1 - sensitivity);
  const stepSize = Math.max(4, Math.round(width / 100)); // Adjust step size based on image size
  
  for (let y = 0; y < height - minHeight; y += stepSize) {
    for (let x = 0; x < width - minWidth; x += stepSize) {
      // Sample points around potential rectangle
      const corners = [
        { x, y },
        { x: x + minWidth, y },
        { x, y: y + minHeight },
        { x: x + minWidth, y: y + minHeight }
      ];
      
      let edgeScore = 0;
      corners.forEach(corner => {
        if (corner.x < width && corner.y < height) {
          const pixelIndex = (corner.y * width + corner.x) * 4;
          const brightness = (data[pixelIndex] + data[pixelIndex + 1] + data[pixelIndex + 2]) / 3;
          
          // Check for edge by comparing with surrounding pixels
          const surroundingBrightness = getSurroundingBrightness(data, corner.x, corner.y, width, height);
          const contrast = Math.abs(brightness - surroundingBrightness);
          
          if (contrast > edgeThreshold) {
            edgeScore += contrast;
          }
        }
      });
      
      // If we found strong edges at the corners, this might be a rectangle
      const avgEdgeScore = edgeScore / corners.length;
      if (avgEdgeScore > edgeThreshold) {
        // Estimate rectangle size based on edge continuity
        const rectWidth = Math.min(maxWidth, Math.max(minWidth, estimateRectWidth(data, x, y, width, height, edgeThreshold)));
        const rectHeight = Math.min(maxHeight, Math.max(minHeight, estimateRectHeight(data, x, y, width, height, edgeThreshold)));
        
        // Calculate confidence based on edge strength and aspect ratio
        const aspectRatio = rectWidth / rectHeight;
        const aspectScore = aspectRatio > 1.3 && aspectRatio < 2.0 ? 1.0 : 0.5; // Prefer card-like aspect ratios
        const confidence = Math.min(1.0, (avgEdgeScore / 255) * aspectScore);
        
        if (confidence > 0.3) { // Minimum confidence threshold
          detectedRects.push({
            x,
            y,
            width: rectWidth,
            height: rectHeight,
            confidence
          });
        }
      }
    }
  }
  
  // Remove overlapping detections
  return filterOverlappingRects(detectedRects);
}

function getSurroundingBrightness(data: Uint8ClampedArray, x: number, y: number, width: number, height: number): number {
  let totalBrightness = 0;
  let count = 0;
  
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const pixelIndex = (ny * width + nx) * 4;
        totalBrightness += (data[pixelIndex] + data[pixelIndex + 1] + data[pixelIndex + 2]) / 3;
        count++;
      }
    }
  }
  
  return count > 0 ? totalBrightness / count : 0;
}

function estimateRectWidth(data: Uint8ClampedArray, x: number, y: number, width: number, height: number, threshold: number): number {
  // Simple estimation by following edges horizontally
  let rectWidth = 60; // Default minimum width
  for (let dx = 60; dx < 200 && x + dx < width; dx += 10) {
    const pixelIndex = (y * width + (x + dx)) * 4;
    const brightness = (data[pixelIndex] + data[pixelIndex + 1] + data[pixelIndex + 2]) / 3;
    const surroundingBrightness = getSurroundingBrightness(data, x + dx, y, width, height);
    
    if (Math.abs(brightness - surroundingBrightness) > threshold) {
      rectWidth = dx;
    } else {
      break;
    }
  }
  return rectWidth;
}

function estimateRectHeight(data: Uint8ClampedArray, x: number, y: number, width: number, height: number, threshold: number): number {
  // Simple estimation by following edges vertically
  let rectHeight = 40; // Default minimum height
  for (let dy = 40; dy < 150 && y + dy < height; dy += 10) {
    const pixelIndex = ((y + dy) * width + x) * 4;
    const brightness = (data[pixelIndex] + data[pixelIndex + 1] + data[pixelIndex + 2]) / 3;
    const surroundingBrightness = getSurroundingBrightness(data, x, y + dy, width, height);
    
    if (Math.abs(brightness - surroundingBrightness) > threshold) {
      rectHeight = dy;
    } else {
      break;
    }
  }
  return rectHeight;
}

function filterOverlappingRects(rects: Array<{ x: number; y: number; width: number; height: number; confidence: number }>): Array<{ x: number; y: number; width: number; height: number; confidence: number }> {
  const filtered = [...rects];
  
  for (let i = 0; i < filtered.length; i++) {
    for (let j = i + 1; j < filtered.length; j++) {
      const rect1 = filtered[i];
      const rect2 = filtered[j];
      
      // Calculate overlap
      const overlapX = Math.max(0, Math.min(rect1.x + rect1.width, rect2.x + rect2.width) - Math.max(rect1.x, rect2.x));
      const overlapY = Math.max(0, Math.min(rect1.y + rect1.height, rect2.y + rect2.height) - Math.max(rect1.y, rect2.y));
      const overlapArea = overlapX * overlapY;
      
      const area1 = rect1.width * rect1.height;
      const area2 = rect2.width * rect2.height;
      const overlapRatio = overlapArea / Math.min(area1, area2);
      
      // If significant overlap, keep the one with higher confidence
      if (overlapRatio > 0.5) {
        if (rect1.confidence >= rect2.confidence) {
          filtered.splice(j, 1);
          j--;
        } else {
          filtered.splice(i, 1);
          i--;
          break;
        }
      }
    }
  }
  
  return filtered.sort((a, b) => b.confidence - a.confidence).slice(0, 3); // Keep top 3 detections
}