import { useCallback, useRef, useState } from 'react';
import { Detection } from './useObjectDetection';

interface AudioSettings {
  enabled: boolean;
  volume: number;
  minDistance: number;
}

export const useAudioAlerts = (settings: AudioSettings) => {
  const lastAlertTime = useRef<{ [key: string]: number }>({});
  const [isSpeaking, setIsSpeaking] = useState(false);
  const alertQueue = useRef<string[]>([]);
  const isProcessing = useRef(false);

  const speak = useCallback((text: string) => {
    if (!settings.enabled || !('speechSynthesis' in window)) return;

    alertQueue.current.push(text);
    processQueue();
  }, [settings.enabled]);

  const processQueue = async () => {
    if (isProcessing.current || alertQueue.current.length === 0) return;
    
    isProcessing.current = true;
    const text = alertQueue.current.shift()!;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = settings.volume;
    utterance.rate = 1.1;
    utterance.pitch = 1.0;
    
    setIsSpeaking(true);
    
    utterance.onend = () => {
      setIsSpeaking(false);
      isProcessing.current = false;
      setTimeout(() => processQueue(), 100);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      isProcessing.current = false;
      processQueue();
    };

    window.speechSynthesis.speak(utterance);
  };

  const announceDetections = useCallback((detections: Detection[]) => {
    if (!settings.enabled || detections.length === 0) return;

    const now = Date.now();
    
    // Focus only on the most immediate obstacle in each zone
    const leftObstacles = detections.filter(d => d.direction === 'left');
    const centerObstacles = detections.filter(d => d.direction === 'center');
    const rightObstacles = detections.filter(d => d.direction === 'right');

    // Find closest obstacle in each direction
    const closestLeft = leftObstacles.sort((a, b) => a.distance - b.distance)[0];
    const closestCenter = centerObstacles.sort((a, b) => a.distance - b.distance)[0];
    const closestRight = rightObstacles.sort((a, b) => a.distance - b.distance)[0];

    // Determine the most critical obstacle overall
    const currentObstacles = [closestLeft, closestCenter, closestRight].filter(Boolean);
    if (currentObstacles.length === 0) return;

    const mostCritical = currentObstacles.sort((a, b) => a.distance - b.distance)[0];
    
    // Only announce if it's within alert distance
    if (mostCritical.distance > settings.minDistance) return;

    const key = `${mostCritical.class}-${mostCritical.direction}-${Math.floor(mostCritical.distance * 2) / 2}`;
    const lastAlert = lastAlertTime.current[key] || 0;
    
    // Determine alert frequency based on distance
    let alertInterval = 10000; // 10 seconds for far
    if (mostCritical.distance < 1) {
      alertInterval = 1500; // 1.5 seconds for critical
    } else if (mostCritical.distance < 2) {
      alertInterval = 3000; // 3 seconds for caution
    }

    if (now - lastAlert < alertInterval) return;

    // Generate navigation guidance
    let message = '';
    
    if (mostCritical.distance < 1) {
      // Critical - immediate action needed
      if (mostCritical.direction === 'center') {
        message = `Stop! ${mostCritical.class} directly ahead!`;
      } else {
        const clearSide = mostCritical.direction === 'left' ? 'right' : 'left';
        message = `Warning! ${mostCritical.class} on the ${mostCritical.direction}. Move ${clearSide}!`;
      }
    } else if (mostCritical.distance < 2) {
      // Caution - prepare to navigate
      if (mostCritical.direction === 'center') {
        // Check if either side is clearer
        const leftDist = closestLeft?.distance || Infinity;
        const rightDist = closestRight?.distance || Infinity;
        const clearerSide = leftDist > rightDist ? 'left' : 'right';
        message = `${mostCritical.class} ahead at ${mostCritical.distance.toFixed(1)} meters. Path clearer on the ${clearerSide}.`;
      } else {
        message = `${mostCritical.class} on the ${mostCritical.direction} at ${mostCritical.distance.toFixed(1)} meters.`;
      }
    } else {
      // Advisory - just awareness
      if (mostCritical.direction === 'center') {
        message = `${mostCritical.class} ahead at ${mostCritical.distance.toFixed(1)} meters. Path clear for now.`;
      } else {
        message = `${mostCritical.class} detected on the ${mostCritical.direction}.`;
      }
    }

    speak(message);
    lastAlertTime.current[key] = now;

    // Clear old alerts from memory (prevent memory leak)
    Object.keys(lastAlertTime.current).forEach(k => {
      if (now - lastAlertTime.current[k] > 30000) {
        delete lastAlertTime.current[k];
      }
    });
  }, [settings, speak]);

  const clearQueue = () => {
    alertQueue.current = [];
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    isProcessing.current = false;
  };

  return { announceDetections, isSpeaking, clearQueue };
};
