import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Detection } from '@/hooks/useObjectDetection';
import { Activity, AlertCircle, CheckCircle } from 'lucide-react';

interface StatusDisplayProps {
  detections: Detection[];
  isActive: boolean;
  isLoading: boolean;
}

export const StatusDisplay = ({ detections, isActive, isLoading }: StatusDisplayProps) => {
  const criticalDetections = detections.filter(d => d.distance < 1);
  const cautionDetections = detections.filter(d => d.distance >= 1 && d.distance < 2);
  const safeDetections = detections.filter(d => d.distance >= 2);

  return (
    <Card className="p-6 bg-card border-border">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Status</h2>
          <Badge variant={isActive ? "default" : "secondary"} className="text-sm px-3 py-1">
            <Activity className="w-4 h-4 mr-1" />
            {isLoading ? 'Loading...' : isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-center">
            <AlertCircle className="w-6 h-6 mx-auto mb-2 text-destructive" />
            <div className="text-2xl font-bold text-destructive">{criticalDetections.length}</div>
            <div className="text-xs text-destructive/80">Critical</div>
            <div className="text-xs text-muted-foreground mt-1">&lt; 1m</div>
          </div>

          <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 text-center">
            <AlertCircle className="w-6 h-6 mx-auto mb-2 text-warning" />
            <div className="text-2xl font-bold text-warning">{cautionDetections.length}</div>
            <div className="text-xs text-warning/80">Caution</div>
            <div className="text-xs text-muted-foreground mt-1">1-2m</div>
          </div>

          <div className="bg-success/10 border border-success/30 rounded-lg p-4 text-center">
            <CheckCircle className="w-6 h-6 mx-auto mb-2 text-success" />
            <div className="text-2xl font-bold text-success">{safeDetections.length}</div>
            <div className="text-xs text-success/80">Safe</div>
            <div className="text-xs text-muted-foreground mt-1">&gt; 2m</div>
          </div>
        </div>

        {isActive && detections.length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <h3 className="text-sm font-semibold text-muted-foreground">Detected Objects:</h3>
            {detections.map((detection, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-secondary rounded-lg text-sm"
              >
                <span className="font-medium capitalize">{detection.class}</span>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-xs">
                    {detection.direction}
                  </Badge>
                  <span className={`font-bold ${
                    detection.distance < 1 ? 'text-destructive' :
                    detection.distance < 2 ? 'text-warning' :
                    'text-success'
                  }`}>
                    {detection.distance.toFixed(1)}m
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
