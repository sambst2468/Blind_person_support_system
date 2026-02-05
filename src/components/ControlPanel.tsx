import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Camera, CameraOff, Volume2, Eye, AlertTriangle } from 'lucide-react';

interface ControlPanelProps {
  isActive: boolean;
  onStart: () => void;
  onStop: () => void;
  audioEnabled: boolean;
  onAudioToggle: (enabled: boolean) => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
  showOverlay: boolean;
  onOverlayToggle: (show: boolean) => void;
  minDistance: number;
  onMinDistanceChange: (distance: number) => void;
  isSpeaking: boolean;
}

export const ControlPanel = ({
  isActive,
  onStart,
  onStop,
  audioEnabled,
  onAudioToggle,
  volume,
  onVolumeChange,
  showOverlay,
  onOverlayToggle,
  minDistance,
  onMinDistanceChange,
  isSpeaking,
}: ControlPanelProps) => {
  return (
    <Card className="p-6 bg-card border-border">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Controls</h2>
          {isSpeaking && (
            <div className="flex items-center gap-2 text-accent animate-pulse">
              <Volume2 className="w-5 h-5" />
              <span className="text-sm font-medium">Speaking...</span>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            onClick={onStart}
            disabled={isActive}
            className="flex-1 h-14 text-lg"
            variant={isActive ? "secondary" : "default"}
          >
            <Camera className="w-5 h-5 mr-2" />
            Start Detection
          </Button>
          <Button
            onClick={onStop}
            disabled={!isActive}
            className="flex-1 h-14 text-lg"
            variant="destructive"
          >
            <CameraOff className="w-5 h-5 mr-2" />
            Stop
          </Button>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="audio" className="text-base font-medium flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              Audio Alerts
            </Label>
            <Switch
              id="audio"
              checked={audioEnabled}
              onCheckedChange={onAudioToggle}
            />
          </div>

          {audioEnabled && (
            <div className="space-y-2 pl-6">
              <Label className="text-sm">Volume: {Math.round(volume * 100)}%</Label>
              <Slider
                value={[volume]}
                onValueChange={([v]) => onVolumeChange(v)}
                min={0}
                max={1}
                step={0.1}
                className="w-full"
              />
            </div>
          )}
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="overlay" className="text-base font-medium flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Visual Overlay
            </Label>
            <Switch
              id="overlay"
              checked={showOverlay}
              onCheckedChange={onOverlayToggle}
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label className="text-base font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Alert Distance: {minDistance.toFixed(1)}m
          </Label>
          <Slider
            value={[minDistance]}
            onValueChange={([v]) => onMinDistanceChange(v)}
            min={1}
            max={5}
            step={0.5}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground pl-6">
            Alert when objects are closer than this distance
          </p>
        </div>
      </div>
    </Card>
  );
};
