import { useState, useEffect, useRef, useCallback } from 'react';

interface CameraError {
  name: string;
  message: string;
  code?: string;
}

interface CameraState {
  stream: MediaStream | null;
  isLoading: boolean;
  error: CameraError | null;
  isSupported: boolean;
  permissions: PermissionState | null;
}

interface CameraConstraints {
  video: {
    width?: { ideal: number; max: number };
    height?: { ideal: number; max: number };
    facingMode?: 'user' | 'environment';
    aspectRatio?: number;
  };
  audio?: boolean;
}

export function useCamera(constraints: CameraConstraints = {
  video: {
    width: { ideal: 1280, max: 1920 },
    height: { ideal: 720, max: 1080 },
    facingMode: 'environment', // Use back camera for card scanning
    aspectRatio: 16/9
  },
  audio: false
}) {
  const [state, setState] = useState<CameraState>({
    stream: null,
    isLoading: false,
    error: null,
    isSupported: typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia,
    permissions: null
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Check camera permissions
  const checkPermissions = useCallback(async () => {
    if (!navigator.permissions) return null;
    
    try {
      const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
      setState(prev => ({ ...prev, permissions: permission.state }));
      return permission.state;
    } catch (error) {
      console.warn('Could not check camera permissions:', error);
      return null;
    }
  }, []);

  // Start camera stream
  const startCamera = useCallback(async () => {
    if (!state.isSupported) {
      setState(prev => ({ 
        ...prev, 
        error: { name: 'NotSupported', message: 'Camera not supported on this device' }
      }));
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Check permissions first
      await checkPermissions();

      // Get user media stream
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      streamRef.current = stream;
      
      // Attach to video element if available
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      setState(prev => ({ 
        ...prev, 
        stream, 
        isLoading: false, 
        error: null 
      }));

      return true;
    } catch (error: any) {
      let cameraError: CameraError;
      
      switch (error.name) {
        case 'NotAllowedError':
          cameraError = {
            name: 'NotAllowedError',
            message: 'Camera access denied. Please allow camera permissions.',
            code: 'PERMISSION_DENIED'
          };
          break;
        case 'NotFoundError':
          cameraError = {
            name: 'NotFoundError', 
            message: 'No camera found on this device.',
            code: 'NO_CAMERA'
          };
          break;
        case 'NotReadableError':
          cameraError = {
            name: 'NotReadableError',
            message: 'Camera is already in use by another application.',
            code: 'CAMERA_IN_USE'
          };
          break;
        case 'OverconstrainedError':
          cameraError = {
            name: 'OverconstrainedError',
            message: 'Camera does not support the requested constraints.',
            code: 'UNSUPPORTED_CONSTRAINTS'
          };
          break;
        default:
          cameraError = {
            name: 'UnknownError',
            message: error.message || 'Failed to access camera.',
            code: 'UNKNOWN'
          };
      }

      setState(prev => ({ 
        ...prev, 
        stream: null, 
        isLoading: false, 
        error: cameraError 
      }));

      return false;
    }
  }, [constraints, state.isSupported, checkPermissions]);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setState(prev => ({ 
      ...prev, 
      stream: null, 
      error: null 
    }));
  }, []);

  // Switch camera (front/back)
  const switchCamera = useCallback(async () => {
    if (!state.stream) return false;
    
    const currentFacingMode = constraints.video?.facingMode;
    const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
    
    stopCamera();
    
    const newConstraints = {
      ...constraints,
      video: {
        ...constraints.video,
        facingMode: newFacingMode
      }
    };

    return startCamera();
  }, [state.stream, constraints, stopCamera, startCamera]);

  // Capture photo from video stream
  const capturePhoto = useCallback((): string | null => {
    if (!videoRef.current || !state.stream) return null;

    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.8);
  }, [state.stream]);

  // Get video dimensions
  const getVideoDimensions = useCallback(() => {
    if (!videoRef.current) return null;
    
    return {
      width: videoRef.current.videoWidth,
      height: videoRef.current.videoHeight
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Update permissions when they change
  useEffect(() => {
    if (!navigator.permissions) return;
    
    const handlePermissionChange = (event: Event) => {
      const permission = event.target as PermissionStatus;
      setState(prev => ({ ...prev, permissions: permission.state }));
    };
    
    let permissionStatus: PermissionStatus;
    
    navigator.permissions.query({ name: 'camera' as PermissionName })
      .then(permission => {
        permissionStatus = permission;
        permission.addEventListener('change', handlePermissionChange);
      })
      .catch(() => {
        // Permissions API not supported
      });
    
    return () => {
      if (permissionStatus) {
        permissionStatus.removeEventListener('change', handlePermissionChange);
      }
    };
  }, []);

  return {
    ...state,
    videoRef,
    startCamera,
    stopCamera,
    switchCamera,
    capturePhoto,
    getVideoDimensions,
    checkPermissions
  };
}