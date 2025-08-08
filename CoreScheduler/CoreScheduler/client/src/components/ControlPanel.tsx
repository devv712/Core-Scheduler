import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SimulationState, Algorithm } from "@/types/simulation";

interface ControlPanelProps {
  simulation: SimulationState;
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onStep: () => void;
  onAlgorithmChange: (algorithm: Algorithm) => void;
  onTimeQuantumChange: (timeQuantum: number) => void;
}

export default function ControlPanel({
  simulation,
  isRunning,
  onStart,
  onPause,
  onReset,
  onStep,
  onAlgorithmChange,
  onTimeQuantumChange,
}: ControlPanelProps) {
  const [timeQuantum, setTimeQuantum] = useState(simulation.timeQuantum);

  const algorithmNames = {
    rr: "Round Robin (RR)",
    priority: "Priority Scheduling",
    fcfs: "First-Come, First-Served",
    sjf: "Shortest Job First",
    srtf: "Shortest Remaining Time First",
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Simulation Control</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Algorithm Selection */}
          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">
              Scheduling Algorithm
            </Label>
            <Select
              value={simulation.algorithm}
              onValueChange={(value) => onAlgorithmChange(value as Algorithm)}
              data-testid="select-algorithm"
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rr">Round Robin (RR)</SelectItem>
                <SelectItem value="priority">Priority Scheduling</SelectItem>
                <SelectItem value="fcfs">First-Come, First-Served</SelectItem>
                <SelectItem value="sjf">Shortest Job First</SelectItem>
                <SelectItem value="srtf">Shortest Remaining Time First</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Time Quantum (RR only) */}
          {simulation.algorithm === "rr" && (
            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">
                Time Quantum
              </Label>
              <Input
                type="number"
                value={timeQuantum}
                onChange={(e) => setTimeQuantum(parseInt(e.target.value))}
                onBlur={() => onTimeQuantumChange(timeQuantum)}
                min={1}
                max={10}
                data-testid="input-time-quantum"
              />
            </div>
          )}

          {/* Context Switch Overhead */}
          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">
              Context Switch Overhead (ms)
            </Label>
            <Input
              type="number"
              value={simulation.contextSwitchOverhead}
              min={0}
              max={5}
              readOnly
              data-testid="input-context-switch-overhead"
            />
          </div>

          {/* Control Buttons */}
          <div className="space-y-3">
            <Button
              onClick={onStart}
              disabled={isRunning || simulation.status === "completed" || simulation.processes.length === 0}
              className="w-full bg-green-600 text-white hover:bg-green-700"
              data-testid="button-start-simulation"
            >
              <i className="fas fa-play mr-2"></i>
              Start Simulation
            </Button>
            <Button
              onClick={onPause}
              disabled={!isRunning}
              className="w-full bg-yellow-500 text-white hover:bg-yellow-600"
              data-testid="button-pause-simulation"
            >
              <i className="fas fa-pause mr-2"></i>
              Pause
            </Button>
            <Button
              onClick={onReset}
              className="w-full bg-gray-500 text-white hover:bg-gray-600"
              data-testid="button-reset-simulation"
            >
              <i className="fas fa-stop mr-2"></i>
              Reset
            </Button>
            <Button
              onClick={onStep}
              disabled={simulation.status === "completed" || simulation.processes.length === 0}
              className="w-full bg-blue-500 text-white hover:bg-blue-600"
              data-testid="button-step-simulation"
            >
              <i className="fas fa-step-forward mr-2"></i>
              Step
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Process Queue Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Queue Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Ready Queue</span>
            <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium" data-testid="text-ready-queue-count">
              {simulation.readyQueue.length}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Running</span>
            <span className="bg-success text-white px-2 py-1 rounded-full text-xs font-medium" data-testid="text-running-process-count">
              {simulation.runningProcess ? 1 : 0}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Completed</span>
            <span className="bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-medium" data-testid="text-completed-processes">
              {simulation.processes.filter(p => p.status === "completed").length}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
