import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { schedulerService } from "@/services/scheduler";
import { useToast } from "@/hooks/use-toast";
import ControlPanel from "@/components/ControlPanel";
import ProcessManagement from "@/components/ProcessManagement";
import GanttChart from "@/components/GanttChart";
import PerformanceMetrics from "@/components/PerformanceMetrics";
import PCBView from "@/components/PCBView";
import DetailedAnalysis from "@/components/DetailedAnalysis";
import type { SimulationState, Algorithm } from "@/types/simulation";

export default function Scheduler() {
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [simulationInterval, setSimulationInterval] = useState<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: simulation, isLoading, error } = useQuery<SimulationState>({
    queryKey: ["/api/simulations/current"],
    retry: false,
  });

  const stepMutation = useMutation({
    mutationFn: (id: string) => schedulerService.stepSimulation(id),
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/simulations/current"], data);
      if (data.status === "completed") {
        setIsSimulationRunning(false);
        if (simulationInterval) {
          clearInterval(simulationInterval);
          setSimulationInterval(null);
        }
        toast({
          title: "Simulation Completed",
          description: "All processes have finished execution.",
        });
      }
    },
    onError: () => {
      toast({
        title: "Simulation Error",
        description: "Failed to execute simulation step.",
        variant: "destructive",
      });
    },
  });

  const createSimulationMutation = useMutation({
    mutationFn: (data: {
      algorithm: Algorithm;
      timeQuantum?: number;
      contextSwitchOverhead?: number;
      processes: any[];
    }) => schedulerService.createSimulation(data),
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/simulations/current"], data);
      toast({
        title: "Simulation Created",
        description: "New simulation initialized successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Creation Failed",
        description: "Failed to create simulation.",
        variant: "destructive",
      });
    },
  });

  const startMutation = useMutation({
    mutationFn: (id: string) => schedulerService.startSimulation(id),
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/simulations/current"], data);
      setIsSimulationRunning(true);
    },
  });

  const pauseMutation = useMutation({
    mutationFn: (id: string) => schedulerService.pauseSimulation(id),
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/simulations/current"], data);
      setIsSimulationRunning(false);
    },
  });

  const resetMutation = useMutation({
    mutationFn: (id: string) => schedulerService.resetSimulation(id),
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/simulations/current"], data);
      setIsSimulationRunning(false);
      if (simulationInterval) {
        clearInterval(simulationInterval);
        setSimulationInterval(null);
      }
    },
  });

  useEffect(() => {
    if (isSimulationRunning && simulation) {
      const interval = setInterval(() => {
        if (simulation.status === "running") {
          stepMutation.mutate(simulation.id);
        }
      }, 500); // Normal speed: 500ms per tick

      setSimulationInterval(interval);

      return () => {
        clearInterval(interval);
      };
    } else {
      if (simulationInterval) {
        clearInterval(simulationInterval);
        setSimulationInterval(null);
      }
    }
  }, [isSimulationRunning, simulation?.id, simulation?.status]);

  useEffect(() => {
    return () => {
      if (simulationInterval) {
        clearInterval(simulationInterval);
      }
    };
  }, [simulationInterval]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading simulation...</p>
        </div>
      </div>
    );
  }

  if (error || !simulation) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-surface shadow-sm border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <i className="fas fa-microchip text-primary-foreground text-sm"></i>
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-foreground">CPU Scheduler Simulator</h1>
                  <p className="text-sm text-muted-foreground">Advanced OS Algorithm Analysis</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="bg-surface rounded-xl shadow-sm border border-border p-8">
            <i className="fas fa-plus-circle text-4xl text-primary mb-4"></i>
            <h2 className="text-2xl font-semibold text-foreground mb-4">No Simulation Found</h2>
            <p className="text-muted-foreground mb-6">
              Create a new simulation to start analyzing CPU scheduling algorithms.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => {
                  createSimulationMutation.mutate({
                    algorithm: "rr",
                    timeQuantum: 3,
                    contextSwitchOverhead: 1,
                    processes: [],
                  });
                }}
                disabled={createSimulationMutation.isPending}
                className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                data-testid="button-create-simulation"
              >
                {createSimulationMutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Creating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus mr-2"></i>
                    Create Empty Simulation
                  </>
                )}
              </button>
              
              <button
                onClick={() => {
                  createSimulationMutation.mutate({
                    algorithm: "rr",
                    timeQuantum: 3,
                    contextSwitchOverhead: 1,
                    processes: [
                      {
                        id: "P1",
                        name: "Process 1",
                        arrivalTime: 0,
                        burstTime: 7,
                        priority: 3,
                        status: "waiting",
                        remainingTime: 7,
                        waitingTime: 0,
                        turnaroundTime: 0,
                        responseTime: -1,
                      },
                      {
                        id: "P2", 
                        name: "Process 2",
                        arrivalTime: 1,
                        burstTime: 4,
                        priority: 1,
                        status: "waiting",
                        remainingTime: 4,
                        waitingTime: 0,
                        turnaroundTime: 0,
                        responseTime: -1,
                      },
                      {
                        id: "P3",
                        name: "Process 3", 
                        arrivalTime: 2,
                        burstTime: 2,
                        priority: 2,
                        status: "waiting",
                        remainingTime: 2,
                        waitingTime: 0,
                        turnaroundTime: 0,
                        responseTime: -1,
                      },
                      {
                        id: "P4",
                        name: "Process 4",
                        arrivalTime: 3,
                        burstTime: 1,
                        priority: 4,
                        status: "waiting",
                        remainingTime: 1,
                        waitingTime: 0,
                        turnaroundTime: 0,
                        responseTime: -1,
                      },
                    ],
                  });
                }}
                disabled={createSimulationMutation.isPending}
                className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                data-testid="button-create-sample-simulation"
              >
                {createSimulationMutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Creating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-magic mr-2"></i>
                    Create Sample Simulation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <i className="fas fa-microchip text-primary-foreground text-sm"></i>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">CPU Scheduler Simulator</h1>
                <p className="text-sm text-muted-foreground">Advanced OS Algorithm Analysis</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = `/api/simulations/${simulation.id}/export/csv`;
                  link.download = `simulation_${simulation.id}.csv`;
                  link.click();
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                data-testid="button-export-results"
              >
                <i className="fas fa-download text-sm"></i>
                <span className="text-sm font-medium">Export Results</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Control Panel */}
          <div className="lg:col-span-1">
            <ControlPanel
              simulation={simulation}
              isRunning={isSimulationRunning}
              onStart={() => startMutation.mutate(simulation.id)}
              onPause={() => pauseMutation.mutate(simulation.id)}
              onReset={() => resetMutation.mutate(simulation.id)}
              onStep={() => stepMutation.mutate(simulation.id)}
              onAlgorithmChange={(algorithm) => {
                createSimulationMutation.mutate({
                  algorithm,
                  timeQuantum: simulation.timeQuantum,
                  contextSwitchOverhead: simulation.contextSwitchOverhead,
                  processes: simulation.processes,
                });
              }}
              onTimeQuantumChange={(timeQuantum) => {
                createSimulationMutation.mutate({
                  algorithm: simulation.algorithm,
                  timeQuantum,
                  contextSwitchOverhead: simulation.contextSwitchOverhead,
                  processes: simulation.processes,
                });
              }}
            />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            <ProcessManagement
              simulation={simulation}
              onUpdate={(updatedSimulation) => {
                queryClient.setQueryData(["/api/simulations/current"], updatedSimulation);
              }}
            />

            <GanttChart simulation={simulation} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PerformanceMetrics simulation={simulation} />
              <div className="space-y-6">
                <PCBView simulation={simulation} />
              </div>
            </div>

            <DetailedAnalysis simulation={simulation} />
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <footer className="bg-surface border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  simulation.status === "running" ? "bg-success simulation-pulse" :
                  simulation.status === "paused" ? "bg-warning" :
                  simulation.status === "completed" ? "bg-primary" : "bg-gray-400"
                }`}></div>
                <span>
                  {simulation.status === "running" ? "Simulation Running" :
                   simulation.status === "paused" ? "Simulation Paused" :
                   simulation.status === "completed" ? "Simulation Completed" : "Simulation Stopped"}
                </span>
              </div>
              <div>Algorithm: <span className="font-mono text-primary">{simulation.algorithm.toUpperCase()}</span></div>
              {simulation.algorithm === "rr" && (
                <div>Quantum: <span className="font-mono">{simulation.timeQuantum}ms</span></div>
              )}
              <div>Processes: <span className="font-mono">{simulation.processes.length}</span></div>
            </div>
            <div className="text-sm text-muted-foreground">
              Current Time: <span className="font-mono">{simulation.currentTime}ms</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
