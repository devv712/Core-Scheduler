import { type Process, type Simulation, type InsertProcess, type InsertSimulation, type UpdateSimulation, type ProcessState, type SimulationState, type ExecutionBlock, type SimulationMetrics, type Algorithm, type ProcessStatus } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Process operations
  createProcess(process: InsertProcess): Promise<ProcessState>;
  getProcess(id: string): Promise<ProcessState | undefined>;
  getAllProcesses(): Promise<ProcessState[]>;
  deleteProcess(id: string): Promise<boolean>;
  
  // Simulation operations
  createSimulation(simulation: InsertSimulation): Promise<SimulationState>;
  getSimulation(id: string): Promise<SimulationState | undefined>;
  updateSimulation(id: string, updates: Partial<SimulationState>): Promise<SimulationState | undefined>;
  deleteSimulation(id: string): Promise<boolean>;
  getCurrentSimulation(): Promise<SimulationState | undefined>;
}

export class MemStorage implements IStorage {
  private processes: Map<string, ProcessState>;
  private simulations: Map<string, SimulationState>;
  private currentSimulationId: string | null;

  constructor() {
    this.processes = new Map();
    this.simulations = new Map();
    this.currentSimulationId = null;
  }

  async createProcess(insertProcess: InsertProcess): Promise<ProcessState> {
    const id = randomUUID();
    const process: ProcessState = {
      id,
      processId: insertProcess.processId,
      arrivalTime: insertProcess.arrivalTime,
      burstTime: insertProcess.burstTime,
      priority: insertProcess.priority,
      status: "waiting" as ProcessStatus,
      remainingTime: insertProcess.burstTime,
      waitingTime: 0,
      turnaroundTime: 0,
      responseTime: -1,
      completionTime: 0,
    };
    this.processes.set(id, process);
    return process;
  }

  async getProcess(id: string): Promise<ProcessState | undefined> {
    return this.processes.get(id);
  }

  async getAllProcesses(): Promise<ProcessState[]> {
    return Array.from(this.processes.values());
  }

  async deleteProcess(id: string): Promise<boolean> {
    return this.processes.delete(id);
  }

  async createSimulation(insertSimulation: InsertSimulation): Promise<SimulationState> {
    const id = randomUUID();
    const simulation: SimulationState = {
      id,
      algorithm: insertSimulation.algorithm as Algorithm,
      timeQuantum: insertSimulation.timeQuantum || 3,
      contextSwitchOverhead: insertSimulation.contextSwitchOverhead || 1,
      currentTime: 0,
      status: "stopped",
      processes: Array.isArray(insertSimulation.processes) ? insertSimulation.processes as ProcessState[] : [],
      executionHistory: [],
      metrics: {
        cpuUtilization: 0,
        avgWaitingTime: 0,
        avgTurnaroundTime: 0,
        avgResponseTime: 0,
        throughput: 0,
        contextSwitches: 0,
        totalExecutionTime: 0,
        completedProcesses: 0,
      },
      readyQueue: [],
      runningProcess: null,
    };
    
    this.simulations.set(id, simulation);
    this.currentSimulationId = id;
    return simulation;
  }

  async getSimulation(id: string): Promise<SimulationState | undefined> {
    return this.simulations.get(id);
  }

  async updateSimulation(id: string, updates: Partial<SimulationState>): Promise<SimulationState | undefined> {
    const simulation = this.simulations.get(id);
    if (!simulation) return undefined;

    const updated = { ...simulation, ...updates };
    this.simulations.set(id, updated);
    return updated;
  }

  async deleteSimulation(id: string): Promise<boolean> {
    const deleted = this.simulations.delete(id);
    if (deleted && this.currentSimulationId === id) {
      this.currentSimulationId = null;
    }
    return deleted;
  }

  async getCurrentSimulation(): Promise<SimulationState | undefined> {
    if (!this.currentSimulationId) return undefined;
    return this.simulations.get(this.currentSimulationId);
  }
}

export const storage = new MemStorage();
