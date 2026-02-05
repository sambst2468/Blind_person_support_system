import { useState, useEffect } from 'react';
import { useWebcam } from '@/hooks/useWebcam';
import { useObjectDetection } from '@/hooks/useObjectDetection';
import { useAudioAlerts } from '@/hooks/useAudioAlerts';
import { VideoCanvas } from '@/components/VideoCanvas';
import { ControlPanel } from '@/components/ControlPanel';
import { StatusDisplay } from '@/components/StatusDisplay';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const Index = () => {
  const { videoRef, isActive, error, startWebcam, stopWebcam } = useWebcam();
  const { detections, isLoading } = useObjectDetection(videoRef);
  
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const [showOverlay, setShowOverlay] = useState(true);
  const [minDistance, setMinDistance] = useState(2.5);

  const { announceDetections, isSpeaking, clearQueue } = useAudioAlerts({
    enabled: audioEnabled,
    volume,
    minDistance,
  });

  useEffect(() => {
    if (isActive && detections.length > 0) {
      announceDetections(detections);
    }
  }, [detections, isActive, announceDetections]);

  const handleStart = async () => {
    await startWebcam();
    toast.success('Detection system activated');
  };

  const handleStop = () => {
    stopWebcam();
    clearQueue();
    toast.info('Detection system stopped');
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="w-12 h-12 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Blind Person Support System
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real-time object detection with audio alerts for navigation assistance
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Video Feed - Spans 2 columns on large screens */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative bg-black rounded-xl overflow-hidden aspect-video shadow-2xl border-2 border-border">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <VideoCanvas
                videoRef={videoRef}
                detections={detections}
                showOverlay={showOverlay}
              />
              
              {!isActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                  <div className="text-center text-white">
                    <Shield className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-xl font-medium">Click "Start Detection" to begin</p>
                  </div>
                </div>
              )}

              {isLoading && isActive && (
                <div className="absolute top-4 right-4 bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="font-medium">Loading AI model...</span>
                  </div>
                </div>
              )}
            </div>

            <StatusDisplay
              detections={detections}
              isActive={isActive}
              isLoading={isLoading}
            />
          </div>

          {/* Control Panel */}
          <div className="lg:col-span-1">
            <ControlPanel
              isActive={isActive}
              onStart={handleStart}
              onStop={handleStop}
              audioEnabled={audioEnabled}
              onAudioToggle={setAudioEnabled}
              volume={volume}
              onVolumeChange={setVolume}
              showOverlay={showOverlay}
              onOverlayToggle={setShowOverlay}
              minDistance={minDistance}
              onMinDistanceChange={setMinDistance}
              isSpeaking={isSpeaking}
            />
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center text-sm text-muted-foreground space-y-2 pt-8 border-t border-border">
          <p>Uses TensorFlow.js COCO-SSD for real-time object detection in the browser</p>
          <p className="text-xs">
            Objects detected: People, Vehicles, Furniture, and common obstacles
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
