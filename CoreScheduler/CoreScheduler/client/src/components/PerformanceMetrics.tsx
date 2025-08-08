import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { SimulationState } from "@/types/simulation";

interface PerformanceMetricsProps {
  simulation: SimulationState;
}

export default function PerformanceMetrics({ simulation }: PerformanceMetricsProps) {
  const { metrics } = simulation;

  const formatNumber = (value: number, decimals: number = 2) => {
    return value.toFixed(decimals);
  };

  const algorithmComparison = [
    { name: "Round Robin", avgWait: 2.67, avgTAT: 8.33, cpuUtil: 85, isBest: false },
    { name: "Priority", avgWait: 1.83, avgTAT: 7.33, cpuUtil: 92, isBest: true },
    { name: "FCFS", avgWait: 3.33, avgTAT: 9.00, cpuUtil: 88, isBest: false },
    { name: "SJF", avgWait: 1.50, avgTAT: 6.83, cpuUtil: 95, isBest: false },
  ];

  return (
    <div className="space-y-6">
      {/* Real-time Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Real-time Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-border">
            <span className="text-sm text-muted-foreground">CPU Utilization</span>
            <div className="flex items-center space-x-2">
              <Progress 
                value={Math.min(100, metrics.cpuUtilization)} 
                className="w-24 h-2"
                data-testid="progress-cpu-utilization"
              />
              <span className="text-sm font-mono" data-testid="text-cpu-utilization">
                {formatNumber(metrics.cpuUtilization)}%
              </span>
            </div>
          </div>
          
          <div className="flex justify-between items-center pb-2 border-b border-border">
            <span className="text-sm text-muted-foreground">Average Waiting Time</span>
            <span className="text-sm font-mono" data-testid="text-avg-waiting-time">
              {formatNumber(metrics.avgWaitingTime)} ms
            </span>
          </div>
          
          <div className="flex justify-between items-center pb-2 border-b border-border">
            <span className="text-sm text-muted-foreground">Average Turnaround Time</span>
            <span className="text-sm font-mono" data-testid="text-avg-turnaround-time">
              {formatNumber(metrics.avgTurnaroundTime)} ms
            </span>
          </div>
          
          <div className="flex justify-between items-center pb-2 border-b border-border">
            <span className="text-sm text-muted-foreground">Average Response Time</span>
            <span className="text-sm font-mono" data-testid="text-avg-response-time">
              {formatNumber(metrics.avgResponseTime)} ms
            </span>
          </div>
          
          <div className="flex justify-between items-center pb-2 border-b border-border">
            <span className="text-sm text-muted-foreground">Throughput</span>
            <span className="text-sm font-mono" data-testid="text-throughput">
              {formatNumber(metrics.throughput, 4)} proc/ms
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Context Switches</span>
            <span className="text-sm font-mono" data-testid="text-context-switches">
              {metrics.contextSwitches}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Algorithm Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Algorithm Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-xs font-medium text-muted-foreground uppercase">
                    Algorithm
                  </th>
                  <th className="text-right py-2 text-xs font-medium text-muted-foreground uppercase">
                    Avg Wait
                  </th>
                  <th className="text-right py-2 text-xs font-medium text-muted-foreground uppercase">
                    Avg TAT
                  </th>
                  <th className="text-right py-2 text-xs font-medium text-muted-foreground uppercase">
                    CPU%
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className={`border-b border-border/50 ${
                  simulation.algorithm === "rr" ? "bg-primary/5" : ""
                }`} data-testid="comparison-row-rr">
                  <td className="py-2 font-medium">
                    Round Robin
                    {simulation.algorithm === "rr" && <i className="fas fa-check text-primary text-xs ml-1"></i>}
                  </td>
                  <td className="py-2 text-right font-mono">{formatNumber(metrics.avgWaitingTime)}</td>
                  <td className="py-2 text-right font-mono">{formatNumber(metrics.avgTurnaroundTime)}</td>
                  <td className="py-2 text-right font-mono">{formatNumber(metrics.cpuUtilization)}%</td>
                </tr>
                
                <tr className={`border-b border-border/50 ${
                  simulation.algorithm === "priority" ? "bg-primary/5" : ""
                }`} data-testid="comparison-row-priority">
                  <td className="py-2 font-medium">
                    Priority
                    {simulation.algorithm === "priority" && <i className="fas fa-check text-primary text-xs ml-1"></i>}
                  </td>
                  <td className="py-2 text-right font-mono">{formatNumber(metrics.avgWaitingTime)}</td>
                  <td className="py-2 text-right font-mono">{formatNumber(metrics.avgTurnaroundTime)}</td>
                  <td className="py-2 text-right font-mono">{formatNumber(metrics.cpuUtilization)}%</td>
                </tr>
                
                <tr className={`border-b border-border/50 ${
                  simulation.algorithm === "fcfs" ? "bg-primary/5" : ""
                }`} data-testid="comparison-row-fcfs">
                  <td className="py-2 font-medium">
                    FCFS
                    {simulation.algorithm === "fcfs" && <i className="fas fa-check text-primary text-xs ml-1"></i>}
                  </td>
                  <td className="py-2 text-right font-mono">{formatNumber(metrics.avgWaitingTime)}</td>
                  <td className="py-2 text-right font-mono">{formatNumber(metrics.avgTurnaroundTime)}</td>
                  <td className="py-2 text-right font-mono">{formatNumber(metrics.cpuUtilization)}%</td>
                </tr>
                
                <tr className={simulation.algorithm === "sjf" ? "bg-primary/5" : ""} data-testid="comparison-row-sjf">
                  <td className="py-2 font-medium">
                    SJF
                    {simulation.algorithm === "sjf" && <i className="fas fa-check text-primary text-xs ml-1"></i>}
                  </td>
                  <td className="py-2 text-right font-mono">{formatNumber(metrics.avgWaitingTime)}</td>
                  <td className="py-2 text-right font-mono">{formatNumber(metrics.avgTurnaroundTime)}</td>
                  <td className="py-2 text-right font-mono">{formatNumber(metrics.cpuUtilization)}%</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 text-xs text-muted-foreground">
            <i className="fas fa-check text-primary"></i> Currently selected algorithm
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
