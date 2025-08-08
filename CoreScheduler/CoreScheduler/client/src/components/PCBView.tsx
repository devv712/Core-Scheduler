import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SimulationState, ProcessState } from "@/types/simulation";

interface PCBViewProps {
  simulation: SimulationState;
}

export default function PCBView({ simulation }: PCBViewProps) {
  const getProcessIcon = (status: string) => {
    switch (status) {
      case "running":
        return "fas fa-microchip text-primary";
      case "ready":
        return "fas fa-clock text-warning";
      case "waiting":
        return "fas fa-pause text-muted-foreground";
      case "completed":
        return "fas fa-check text-success";
      default:
        return "fas fa-circle text-muted-foreground";
    }
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
          <CardTitle className="text-lg font-semibold">Process Control Blocks (PCB)</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <i className="fas fa-list mr-1"></i>List View
            </Button>
            <Button variant="default" size="sm" data-testid="button-card-view">
              <i className="fas fa-th mr-1"></i>Card View
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {simulation.processes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <i className="fas fa-microchip text-2xl mb-2"></i>
            <p>No processes to display</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {simulation.processes.map((process: ProcessState) => (
              <div 
                key={process.id} 
                className="border border-border rounded-lg p-4"
                data-testid={`pcb-card-${process.processId}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-mono font-semibold">{process.processId}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(process.status)}`}>
                      {getStatusDisplay(process.status)}
                    </span>
                  </div>
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    <i className={`${getProcessIcon(process.status)} text-xs`}></i>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">PID:</span>
                    <span className="font-mono" data-testid={`pcb-pid-${process.processId}`}>
                      {process.id.slice(0, 8)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Arrival:</span>
                    <span className="font-mono" data-testid={`pcb-arrival-${process.processId}`}>
                      {process.arrivalTime}ms
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Burst:</span>
                    <span className="font-mono" data-testid={`pcb-burst-${process.processId}`}>
                      {process.burstTime}ms
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Remaining:</span>
                    <span className={`font-mono ${process.remainingTime > 0 ? 'text-warning' : 'text-success'}`} data-testid={`pcb-remaining-${process.processId}`}>
                      {process.remainingTime}ms
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Priority:</span>
                    <span className="font-mono" data-testid={`pcb-priority-${process.processId}`}>
                      {process.priority}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Wait Time:</span>
                    <span className="font-mono" data-testid={`pcb-wait-time-${process.processId}`}>
                      {process.waitingTime}ms
                    </span>
                  </div>

                  {process.status === "completed" && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Turnaround:</span>
                        <span className="font-mono" data-testid={`pcb-turnaround-${process.processId}`}>
                          {process.turnaroundTime}ms
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Response:</span>
                        <span className="font-mono" data-testid={`pcb-response-${process.processId}`}>
                          {process.responseTime >= 0 ? `${process.responseTime}ms` : 'N/A'}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
