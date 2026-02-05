import { useEffect, useRef, useState } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';

export interface Detection {
  class: string;
  score: number;
  bbox: [number, number, number, number];
  distance: number;
  direction: 'left' | 'center' | 'right';
}

export const useObjectDetection = (videoRef: React.RefObject<HTMLVideoElement>) => {
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const animationFrameId = useRef<number>();

  useEffect(() => {
    const loadModel = async () => {
      try {
        const loadedModel = await cocoSsd.load();
        setModel(loadedModel);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading model:', error);
        setIsLoading(false);
      }
    };
    loadModel();
  }, []);

  const estimateDistance = (bbox: [number, number, number, number], className: string): number => {
    const [, , width, height] = bbox;
    const area = width * height;
    
    // Heuristic: larger objects are closer (simplified)
    // Average known object sizes for common classes
    const referenceAreas: { [key: string]: number } = {
      person: 150000,
      car: 200000,
      bicycle: 100000,
      chair: 80000,
      default: 100000,
    };
    
    const refArea = referenceAreas[className] || referenceAreas.default;
    const distance = Math.sqrt(refArea / area) * 2;
    
    return Math.max(0.5, Math.min(10, distance));
  };

  const getDirection = (bbox: [number, number, number, number], videoWidth: number): 'left' | 'center' | 'right' => {
    const [x, , width] = bbox;
    const centerX = x + width / 2;
    const relativePos = centerX / videoWidth;
    
    if (relativePos < 0.33) return 'left';
    if (relativePos > 0.66) return 'right';
    return 'center';
  };

  const detect = async () => {
    if (!model || !videoRef.current || videoRef.current.readyState !== 4) {
      animationFrameId.current = requestAnimationFrame(detect);
      return;
    }

    const predictions = await model.detect(videoRef.current);
    const videoWidth = videoRef.current.videoWidth;
    
    const enrichedDetections: Detection[] = predictions.map(pred => ({
      class: pred.class,
      score: pred.score,
      bbox: pred.bbox,
      distance: estimateDistance(pred.bbox, pred.class),
      direction: getDirection(pred.bbox, videoWidth),
    }));

    setDetections(enrichedDetections);
    animationFrameId.current = requestAnimationFrame(detect);
  };

  useEffect(() => {
    if (model) {
      detect();
    }
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [model]);

  return { detections, isLoading, model };
};
