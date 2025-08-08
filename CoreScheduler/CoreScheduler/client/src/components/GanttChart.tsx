import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { SimulationState, ExecutionBlock } from "@/types/simulation";

interface GanttChartProps {
  simulation: SimulationState;
}

export default function GanttChart({ simulation }: GanttChartProps) {
  const { processColors, timeScale, maxTime } = useMemo(() => {
    const colors = [
      "gantt-process-p1",
      "gantt-process-p2", 
      "gantt-process-p3",
      "gantt-process-p4",
      "gantt-process-p5",
    ];
    
    const processColorMap: Record<string, string> = {};
    simulation.processes.forEach((process, index) => {
      processColorMap[process.processId] = colors[index % colors.length];
    });

    const maxExecutionTime = Math.max(
      simulation.currentTime,
      ...simulation.executionHistory.map(block => block.endTime),
      20 // Minimum scale
    );

    const scale = Array.from({ length: maxExecutionTime + 5 }, (_, i) => i);

    return {
      processColors: processColorMap,
      timeScale: scale,
      maxTime: maxExecutionTime,
    };
  }, [simulation.processes, simulation.executionHistory, simulation.currentTime]);

  const currentTimePosition = (simulation.currentTime / maxTime) * 100;

  const getProcessExecutionBlocks = (processId: string) => {
    return simulation.executionHistory
      .filter(block => block.processId === processId && !block.isContextSwitch)
      .map(block => ({
        ...block,
        left: (block.startTime / maxTime) * 100,
        width: ((block.endTime - block.startTime) / maxTime) * 100,
      }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Gantt Chart Visualization</CardTitle>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>Current Time:</span>
              <span className="font-mono bg-muted px-2 py-1 rounded" data-testid="text-current-time">
                {simulation.currentTime}
              </span>
            </div>
            <Button variant="ghost" size="sm" data-testid="button-expand-gantt">
              <i className="fas fa-expand"></i>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {simulation.processes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <i className="fas fa-chart-gantt text-2xl mb-2"></i>
            <p>Add processes to see Gantt chart visualization</p>
          </div>
        ) : (
          <div className="relative">
            {/* Time Scale */}
            <div className="flex mb-2 text-xs text-muted-foreground font-mono">
              <div className="w-12 flex-shrink-0"></div>
              <div className="flex-1 relative">
                <div className="flex">
                  {timeScale.slice(0, Math.min(20, maxTime + 5)).map((time) => (
                    <div key={time} className="flex-1 text-center border-r border-border" data-testid={`time-marker-${time}`}>
                      {time}
                    </div>
                  ))}
                </div>
                {/* Current Time Indicator */}
                {simulation.currentTime > 0 && (
                  <div 
                    className="absolute top-0 h-full w-0.5 bg-destructive z-10"
                    style={{ left: `${currentTimePosition}%` }}
                    data-testid="current-time-indicator"
                  >
                    <div className="absolute -top-2 -left-2 w-4 h-4 bg-destructive rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Process Execution Blocks */}
            <div className="space-y-2">
              {simulation.processes.map((process) => {
                const executionBlocks = getProcessExecutionBlocks(process.processId);
                return (
                  <div key={process.id} className="flex items-center" data-testid={`gantt-row-${process.processId}`}>
                    <div className="w-12 text-sm font-mono text-foreground">{process.processId}</div>
                    <div className="flex-1 relative h-8 bg-muted/30 rounded">
                      {executionBlocks.map((block, index) => (
                        <div
                          key={index}
                          className={`absolute h-full text-white text-xs flex items-center justify-center rounded ${processColors[process.processId]}`}
                          style={{
                            left: `${block.left}%`,
                            width: `${block.width}%`,
                          }}
                          data-testid={`execution-block-${process.processId}-${index}`}
                        >
                          {block.endTime - block.startTime > 1 ? `${block.startTime}-${block.endTime}` : block.startTime}
                        </div>
                      ))}
                      
                      {/* Running indicator */}
                      {simulation.runningProcess?.processId === process.processId && simulation.status === "running" && (
                        <div
                          className={`absolute h-full text-white text-xs flex items-center justify-center rounded opacity-70 ${processColors[process.processId]}`}
                          style={{
                            left: `${currentTimePosition}%`,
                            width: `${Math.min(10, (1 / maxTime) * 100)}%`,
                          }}
                          data-testid={`running-indicator-${process.processId}`}
                        >
                          <i className="fas fa-play text-xs"></i>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center space-x-6 text-xs">
              {simulation.processes.map((process) => (
                <div key={process.id} className="flex items-center space-x-2" data-testid={`legend-${process.processId}`}>
                  <div className={`w-3 h-3 rounded ${processColors[process.processId]}`}></div>
                  <span>{process.processId}</span>
                </div>
              ))}
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-muted rounded"></div>
                <span>Idle Time</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
