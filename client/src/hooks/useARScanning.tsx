import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { useHeroes } from "@/lib/stores/useHeroes";

export interface DetectedCard {
  id: string;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence: number;
  timestamp: number;
  heroId?: string; // Matched hero if recognized
}

export interface ScanResult {
  id: string;
  detectedCard: DetectedCard;
  heroId?: string;
  capturedImage?: string;
  timestamp: number;
  processed: boolean;
}

interface ARScanningState {
  // Scanning state
  isScanning: boolean;
  isPaused: boolean;
  scanMode: 'auto' | 'manual';
  
  // Detection state
  detectedCards: DetectedCard[];
  currentDetection: DetectedCard | null;
  scanResults: ScanResult[];
  
  // UI state
  showOverlay: boolean;
  targetArea: {
    x: number;
    y: number; 
    width: number;
    height: number;
  };
  
  // Settings
  detectionSensitivity: number; // 0.1 to 1.0
  minConfidence: number; // minimum confidence for detection
  cooldownMs: number; // cooldown between detections
  
  // Status
  isProcessing: boolean;
  lastScanTime: number | null;
  error: string | null;
  
  // Actions
  startScanning: () => void;
  stopScanning: () => void;
  pauseScanning: () => void;
  resumeScanning: () => void;
  setScanMode: (mode: 'auto' | 'manual') => void;
  
  // Detection actions
  addDetectedCard: (card: DetectedCard) => void;
  clearDetections: () => void;
  processDetection: (detection: DetectedCard, capturedImage?: string) => Promise<ScanResult | null>;
  
  // Results actions
  getScanResults: () => ScanResult[];
  clearScanResults: () => void;
  markResultProcessed: (resultId: string) => void;
  
  // Settings actions
  updateSettings: (settings: Partial<{
    detectionSensitivity: number;
    minConfidence: number;
    cooldownMs: number;
    targetArea: { x: number; y: number; width: number; height: number };
  }>) => void;
  
  // UI actions
  setShowOverlay: (show: boolean) => void;
  setError: (error: string | null) => void;
}

export const useARScanning = create<ARScanningState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    isScanning: false,
    isPaused: false,
    scanMode: 'auto',
    
    detectedCards: [],
    currentDetection: null,
    scanResults: [],
    
    showOverlay: true,
    targetArea: {
      x: 0.2, // 20% from left
      y: 0.3, // 30% from top  
      width: 0.6, // 60% width
      height: 0.4 // 40% height
    },
    
    detectionSensitivity: 0.7,
    minConfidence: 0.6,
    cooldownMs: 1000,
    
    isProcessing: false,
    lastScanTime: null,
    error: null,
    
    // Scanning control actions
    startScanning: () => {
      set({ 
        isScanning: true, 
        isPaused: false, 
        error: null,
        detectedCards: [],
        currentDetection: null
      });
    },
    
    stopScanning: () => {
      set({ 
        isScanning: false, 
        isPaused: false,
        detectedCards: [],
        currentDetection: null,
        isProcessing: false
      });
    },
    
    pauseScanning: () => {
      set({ isPaused: true });
    },
    
    resumeScanning: () => {
      set({ isPaused: false, error: null });
    },
    
    setScanMode: (mode) => {
      set({ scanMode: mode });
    },
    
    // Detection actions
    addDetectedCard: (card) => {
      const state = get();
      
      // Check cooldown
      if (state.lastScanTime && Date.now() - state.lastScanTime < state.cooldownMs) {
        return;
      }
      
      // Check confidence threshold
      if (card.confidence < state.minConfidence) {
        return;
      }
      
      set({ 
        detectedCards: [...state.detectedCards.slice(-4), card], // Keep last 5 detections
        currentDetection: card,
        lastScanTime: Date.now()
      });
      
      // Auto-process if in auto mode
      if (state.scanMode === 'auto' && !state.isProcessing) {
        get().processDetection(card);
      }
    },
    
    clearDetections: () => {
      set({ 
        detectedCards: [], 
        currentDetection: null 
      });
    },
    
    processDetection: async (detection, capturedImage) => {
      const state = get();
      if (state.isProcessing) return null;
      
      set({ isProcessing: true, error: null });
      
      try {
        // Simulate card recognition logic
        // In a real implementation, this would use ML/AI to identify the hero card
        const heroId = await recognizeHeroCard(detection, capturedImage);
        
        const scanResult: ScanResult = {
          id: `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          detectedCard: detection,
          heroId,
          capturedImage,
          timestamp: Date.now(),
          processed: false
        };
        
        set(state => ({
          scanResults: [...state.scanResults, scanResult],
          isProcessing: false
        }));
        
        // If hero was recognized, integrate with hero system
        if (heroId) {
          const heroStore = useHeroes.getState();
          heroStore.selectHero(heroId);
        }
        
        return scanResult;
        
      } catch (error) {
        set({ 
          isProcessing: false, 
          error: error instanceof Error ? error.message : 'Failed to process detection'
        });
        return null;
      }
    },
    
    // Results actions
    getScanResults: () => {
      return get().scanResults;
    },
    
    clearScanResults: () => {
      set({ scanResults: [] });
    },
    
    markResultProcessed: (resultId) => {
      set(state => ({
        scanResults: state.scanResults.map(result => 
          result.id === resultId ? { ...result, processed: true } : result
        )
      }));
    },
    
    // Settings actions
    updateSettings: (settings) => {
      set(state => ({
        ...state,
        ...settings
      }));
    },
    
    // UI actions
    setShowOverlay: (show) => {
      set({ showOverlay: show });
    },
    
    setError: (error) => {
      set({ error });
    }
  }))
);

// Helper function to simulate hero card recognition
async function recognizeHeroCard(detection: DetectedCard, capturedImage?: string): Promise<string | undefined> {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
  
  // Simple mock recognition based on detection properties
  // In a real implementation, this would use computer vision/ML
  const { boundingBox, confidence } = detection;
  const aspectRatio = boundingBox.width / boundingBox.height;
  
  // Mock logic: different heroes based on card properties
  if (confidence > 0.8 && aspectRatio > 1.4 && aspectRatio < 1.8) {
    // Standard card aspect ratio detected
    const heroes = ['aqua', 'hemp', 'voltra', 'graphene', 'trader'];
    const randomIndex = Math.floor((boundingBox.x + boundingBox.y) * heroes.length) % heroes.length;
    
    // 70% chance of recognition for high confidence detections
    if (Math.random() < 0.7) {
      return heroes[randomIndex];
    }
  }
  
  return undefined; // No hero recognized
}

// Export additional utilities
export const ARScanningUtils = {
  // Convert normalized coordinates to pixel coordinates
  normalizedToPixels: (
    normalized: { x: number; y: number; width: number; height: number }, 
    containerWidth: number, 
    containerHeight: number
  ) => ({
    x: normalized.x * containerWidth,
    y: normalized.y * containerHeight,
    width: normalized.width * containerWidth,
    height: normalized.height * containerHeight
  }),
  
  // Check if a point is inside the target area
  isInTargetArea: (
    point: { x: number; y: number },
    targetArea: { x: number; y: number; width: number; height: number }
  ) => {
    return point.x >= targetArea.x && 
           point.x <= targetArea.x + targetArea.width &&
           point.y >= targetArea.y && 
           point.y <= targetArea.y + targetArea.height;
  },
  
  // Calculate detection quality score
  calculateQuality: (detection: DetectedCard, targetArea: { x: number; y: number; width: number; height: number }) => {
    const centerX = detection.boundingBox.x + detection.boundingBox.width / 2;
    const centerY = detection.boundingBox.y + detection.boundingBox.height / 2;
    const targetCenterX = targetArea.x + targetArea.width / 2;
    const targetCenterY = targetArea.y + targetArea.height / 2;
    
    const distanceFromCenter = Math.sqrt(
      Math.pow(centerX - targetCenterX, 2) + Math.pow(centerY - targetCenterY, 2)
    );
    
    const maxDistance = Math.sqrt(
      Math.pow(targetArea.width / 2, 2) + Math.pow(targetArea.height / 2, 2)
    );
    
    const positionScore = 1 - (distanceFromCenter / maxDistance);
    const sizeScore = Math.min(detection.boundingBox.width / targetArea.width, 1) * 
                     Math.min(detection.boundingBox.height / targetArea.height, 1);
    
    return (positionScore * 0.4 + sizeScore * 0.3 + detection.confidence * 0.3);
  }
};