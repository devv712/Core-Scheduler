import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { schedulerService } from "@/services/scheduler";
import type { SimulationState, NewProcess } from "@/types/simulation";

interface ProcessManagementProps {
  simulation: SimulationState;
  onUpdate: (simulation: SimulationState) => void;
}

export default function ProcessManagement({ simulation, onUpdate }: ProcessManagementProps) {
  const [newProcess, setNewProcess] = useState<NewProcess>({
    processId: "",
    arrivalTime: 0,
    burstTime: 1,
    priority: 1,
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const addProcessMutation = useMutation({
    mutationFn: (process: NewProcess) => schedulerService.createProcess(process),
    onSuccess: (newProcessState) => {
      const updatedSimulation = {
        ...simulation,
        processes: [...simulation.processes, newProcessState],
      };
      onUpdate(updatedSimulation);
      queryClient.setQueryData(["/api/simulations/current"], updatedSimulation);
      
      setNewProcess({
        processId: "",
        arrivalTime: 0,
        burstTime: 1,
        priority: 1,
      });
      
      toast({
        title: "Process Added",
        description: `Process ${newProcessState.processId} has been added to the simulation.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add process. Please check your input.",
        variant: "destructive",
      });
    },
  });

  const deleteProcessMutation = useMutation({
    mutationFn: (id: string) => schedulerService.deleteProcess(id),
    onSuccess: (_, deletedId) => {
      const updatedSimulation = {
        ...simulation,
        processes: simulation.processes.filter(p => p.id !== deletedId),
      };
      onUpdate(updatedSimulation);
      queryClient.setQueryData(["/api/simulations/current"], updatedSimulation);
      
      toast({
        title: "Process Removed",
        description: "Process has been removed from the simulation.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove process.",
        variant: "destructive",
      });
    },
  });

  const handleAddProcess = () => {
    if (!newProcess.processId.trim()) {
      toast({
        title: "Validation Error",
        description: "Process ID is required.",
        variant: "destructive",
      });
      return;
    }

    if (simulation.processes.some(p => p.processId === newProcess.processId)) {
      toast({
        title: "Validation Error",
        description: "Process ID must be unique.",
        variant: "destructive",
      });
      return;
    }

    addProcessMutation.mutate(newProcess);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "waiting":
        return "process-status-waiting";
      case "ready":
        return "process-status-ready";
      case "running":
        return "process-status-running";
      case "completed":
        return "process-status-completed";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusDisplay = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Process Management</CardTitle>
          <Button
            onClick={() => {
              const nextId = `P${simulation.processes.length + 1}`;
              setNewProcess(prev => ({ ...prev, processId: nextId }));
            }}
            className="bg-primary text-primary-foreground hover:opacity-90"
            data-testid="button-generate-process-id"
          >
            <i className="fas fa-plus text-sm mr-2"></i>
            Generate ID
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Add Process Form */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 p-4 bg-muted rounded-lg">
          <div>
            <Label className="text-sm font-medium text-foreground mb-1 block">Process ID</Label>
            <Input
              type="text"
              placeholder="P1"
              value={newProcess.processId}
              onChange={(e) => setNewProcess(prev => ({ ...prev, processId: e.target.value }))}
              data-testid="input-process-id"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-foreground mb-1 block">Arrival Time</Label>
            <Input
              type="number"
              placeholder="0"
              min="0"
              value={newProcess.arrivalTime}
              onChange={(e) => setNewProcess(prev => ({ ...prev, arrivalTime: parseInt(e.target.value) || 0 }))}
              data-testid="input-arrival-time"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-foreground mb-1 block">Burst Time</Label>
            <Input
              type="number"
              placeholder="5"
              min="1"
              value={newProcess.burstTime}
              onChange={(e) => setNewProcess(prev => ({ ...prev, burstTime: parseInt(e.target.value) || 1 }))}
              data-testid="input-burst-time"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-foreground mb-1 block">Priority</Label>
            <Input
              type="number"
              placeholder="1"
              min="1"
              max="10"
              value={newProcess.priority}
              onChange={(e) => setNewProcess(prev => ({ ...prev, priority: parseInt(e.target.value) || 1 }))}
              data-testid="input-priority"
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={handleAddProcess}
              disabled={addProcessMutation.isPending || !newProcess.processId.trim()}
              className="w-full bg-primary text-primary-foreground hover:opacity-90"
              data-testid="button-add-process"
            >
              {addProcessMutation.isPending ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                <i className="fas fa-plus"></i>
              )}
            </Button>
          </div>
        </div>

        {/* Process List */}
        {simulation.processes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <i className="fas fa-inbox text-2xl mb-2"></i>
            <p>No processes added yet. Add a process to start the simulation.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-sm font-medium text-foreground">Process ID</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-foreground">Arrival Time</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-foreground">Burst Time</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-foreground">Priority</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-foreground">Status</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-foreground">Remaining</th>
                  <th className="text-left py-2 px-3 text-sm font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {simulation.processes.map((process) => (
                  <tr key={process.id} className="border-b border-border/50" data-testid={`row-process-${process.processId}`}>
                    <td className="py-2 px-3 text-sm font-mono">{process.processId}</td>
                    <td className="py-2 px-3 text-sm">{process.arrivalTime}</td>
                    <td className="py-2 px-3 text-sm">{process.burstTime}</td>
                    <td className="py-2 px-3 text-sm">{process.priority}</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(process.status)}`}>
                        {getStatusDisplay(process.status)}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-sm font-mono">{process.remainingTime}</td>
                    <td className="py-2 px-3">
                      <Button
                        onClick={() => deleteProcessMutation.mutate(process.id)}
                        disabled={deleteProcessMutation.isPending || simulation.status === "running"}
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive/80"
                        data-testid={`button-delete-process-${process.processId}`}
                      >
                        <i className="fas fa-times"></i>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
