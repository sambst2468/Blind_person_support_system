import { useEffect, useRef } from 'react';
import { Detection } from '@/hooks/useObjectDetection';

interface VideoCanvasProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  detections: Detection[];
  showOverlay: boolean;
}

export const VideoCanvas = ({ videoRef, detections, showOverlay }: VideoCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !videoRef.current || !showOverlay) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    detections.forEach(detection => {
      const [x, y, width, height] = detection.bbox;
      
      // Color based on distance
      let color = '#10b981'; // green (safe)
      if (detection.distance < 1) {
        color = '#ef4444'; // red (immediate)
      } else if (detection.distance < 2) {
        color = '#f59e0b'; // amber (caution)
      }

      // Draw bounding box
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, width, height);

      // Draw filled background for label
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.8;
      ctx.fillRect(x, y - 30, width, 30);
      ctx.globalAlpha = 1;

      // Draw label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      const label = `${detection.class} ${detection.distance.toFixed(1)}m ${detection.direction}`;
      ctx.fillText(label, x + 5, y - 8);

      // Draw direction indicator
      const centerX = x + width / 2;
      ctx.beginPath();
      ctx.arc(centerX, y + height + 15, 8, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
    });

  }, [detections, showOverlay, videoRef]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ display: showOverlay ? 'block' : 'none' }}
    />
  );
};
