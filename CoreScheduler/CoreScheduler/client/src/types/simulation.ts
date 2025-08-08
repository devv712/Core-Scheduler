export type Algorithm = "rr" | "priority" | "fcfs" | "sjf" | "srtf";
export type ProcessStatus = "waiting" | "ready" | "running" | "completed";
export type SimulationStatus = "running" | "paused" | "stopped" | "completed";

export interface ProcessState {
  id: string;
  processId: string;
  arrivalTime: number;
  burstTime: number;
  priority: number;
  status: ProcessStatus;
  remainingTime: number;
  waitingTime: number;
  turnaroundTime: number;
  responseTime: number;
  completionTime: number;
  startTime?: number;
}

export interface ExecutionBlock {
  processId: string;
  startTime: number;
  endTime: number;
  isContextSwitch?: boolean;
}

export interface SimulationMetrics {
  cpuUtilization: number;
  avgWaitingTime: number;
  avgTurnaroundTime: number;
  avgResponseTime: number;
  throughput: number;
  contextSwitches: number;
  totalExecutionTime: number;
  completedProcesses: number;
}

export interface SimulationState {
  id: string;
  algorithm: Algorithm;
  timeQuantum: number;
  contextSwitchOverhead: number;
  currentTime: number;
  status: SimulationStatus;
  processes: ProcessState[];
  executionHistory: ExecutionBlock[];
  metrics: SimulationMetrics;
  readyQueue: ProcessState[];
  runningProcess: ProcessState | null;
}

export interface NewProcess {
  processId: string;
  arrivalTime: number;
  burstTime: number;
  priority: number;
}
