import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import type { SimulationState } from "@/types/simulation";

interface DetailedAnalysisProps {
  simulation: SimulationState;
}

export default function DetailedAnalysis({ simulation }: DetailedAnalysisProps) {
  const { toast } = useToast();
  const { metrics, processes } = simulation;

  const handleExportCSV = async () => {
    try {
      const response = await fetch(`/api/simulations/${simulation.id}/export/csv`);
      const csvData = await response.text();
      
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `simulation_${simulation.id}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: "CSV file has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export CSV file.",
        variant: "destructive",
      });
    }
  };

  const handleExportGantt = () => {
    toast({
      title: "Export Gantt Chart",
      description: "Gantt chart export feature coming soon!",
    });
  };

  const handleExportMetrics = () => {
    const metricsData = {
      algorithm: simulation.algorithm,
      timeQuantum: simulation.timeQuantum,
      metrics: simulation.metrics,
      processes: simulation.processes.map(p => ({
        processId: p.processId,
        arrivalTime: p.arrivalTime,
        burstTime: p.burstTime,
        priority: p.priority,
        waitingTime: p.waitingTime,
        turnaroundTime: p.turnaroundTime,
        responseTime: p.responseTime,
      }))
    };

    const jsonData = JSON.stringify(metricsData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `metrics_${simulation.id}.json`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Metrics Exported",
      description: "Metrics data has been exported as JSON.",
    });
  };

  const handleExportConfig = () => {
    const configData = {
      algorithm: simulation.algorithm,
      timeQuantum: simulation.timeQuantum,
      contextSwitchOverhead: simulation.contextSwitchOverhead,
      processes: simulation.processes.map(p => ({
        processId: p.processId,
        arrivalTime: p.arrivalTime,
        burstTime: p.burstTime,
        priority: p.priority,
      }))
    };

    const jsonData = JSON.stringify(configData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `config_${simulation.id}.json`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Configuration Exported",
      description: "Simulation configuration has been exported.",
    });
  };

  const calculateEfficiency = () => {
    if (metrics.totalExecutionTime === 0) return 0;
    const totalBurstTime = processes.reduce((sum, p) => sum + p.burstTime, 0);
    return (totalBurstTime / metrics.totalExecutionTime) * 100;
  };

  const calculateFairnessIndex = () => {
    if (processes.length === 0) return 0;
    const waitTimes = processes.map(p => p.waitingTime);
    const avgWait = waitTimes.reduce((sum, w) => sum + w, 0) / waitTimes.length;
    const variance = waitTimes.reduce((sum, w) => sum + Math.pow(w - avgWait, 2), 0) / waitTimes.length;
    const coefficient = Math.sqrt(variance) / avgWait;
    return Math.max(0, 100 - (coefficient * 50)); // Convert to fairness percentage
  };

  const calculateResponseQuality = () => {
    const completed = processes.filter(p => p.status === "completed");
    if (completed.length === 0) return 0;
    const avgResponse = completed.reduce((sum, p) => sum + Math.max(0, p.responseTime), 0) / completed.length;
    return Math.max(0, 100 - (avgResponse * 5)); // Convert to quality percentage
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Detailed Analysis & Reports</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleExportCSV}
              className="bg-primary text-primary-foreground hover:opacity-90"
              data-testid="button-export-csv"
            >
              <i className="fas fa-file-csv mr-2"></i>
              Export CSV
            </Button>
            <Button
              onClick={() => {
                toast({
                  title: "PDF Report",
                  description: "PDF report generation feature coming soon!",
                });
              }}
              variant="outline"
              data-testid="button-generate-report"
            >
              <i className="fas fa-file-pdf mr-2"></i>
              Generate Report
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Statistical Summary */}
          <div>
            <h4 className="font-semibold text-foreground mb-3">Statistical Summary</h4>
            <div className="bg-muted rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-primary" data-testid="stat-total-processes">
                    {processes.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Processes</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-success" data-testid="stat-completed-processes">
                    {metrics.completedProcesses}
                  </div>
                  <div className="text-xs text-muted-foreground">Completed</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-secondary" data-testid="stat-total-execution-time">
                    {metrics.totalExecutionTime}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Time (ms)</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-warning" data-testid="stat-context-switches">
                    {metrics.contextSwitches}
                  </div>
                  <div className="text-xs text-muted-foreground">Context Switches</div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Breakdown */}
          <div>
            <h4 className="font-semibold text-foreground mb-3">Performance Breakdown</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Execution Efficiency</span>
                <div className="flex items-center space-x-2">
                  <Progress value={calculateEfficiency()} className="w-20 h-2" />
                  <span className="text-sm font-mono" data-testid="text-execution-efficiency">
                    {calculateEfficiency().toFixed(0)}%
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Fairness Index</span>
                <div className="flex items-center space-x-2">
                  <Progress value={calculateFairnessIndex()} className="w-20 h-2" />
                  <span className="text-sm font-mono" data-testid="text-fairness-index">
                    {calculateFairnessIndex().toFixed(0)}%
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Response Quality</span>
                <div className="flex items-center space-x-2">
                  <Progress value={calculateResponseQuality()} className="w-20 h-2" />
                  <span className="text-sm font-mono" data-testid="text-response-quality">
                    {calculateResponseQuality().toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="mt-6 pt-4 border-t border-border">
          <h4 className="font-semibold text-foreground mb-3">Export Options</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              onClick={handleExportGantt}
              variant="outline"
              className="flex items-center justify-center space-x-2 p-3"
              data-testid="button-export-gantt"
            >
              <i className="fas fa-chart-gantt text-primary"></i>
              <span className="text-sm">Gantt Chart</span>
            </Button>
            
            <Button
              onClick={handleExportMetrics}
              variant="outline"
              className="flex items-center justify-center space-x-2 p-3"
              data-testid="button-export-metrics"
            >
              <i className="fas fa-chart-line text-success"></i>
              <span className="text-sm">Metrics</span>
            </Button>
            
            <Button
              onClick={handleExportConfig}
              variant="outline"
              className="flex items-center justify-center space-x-2 p-3"
              data-testid="button-export-config"
            >
              <i className="fas fa-cog text-secondary"></i>
              <span className="text-sm">Config</span>
            </Button>
            
            <Button
              onClick={handleExportCSV}
              variant="outline"
              className="flex items-center justify-center space-x-2 p-3"
              data-testid="button-export-all"
            >
              <i className="fas fa-file-archive text-warning"></i>
              <span className="text-sm">Full Report</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
