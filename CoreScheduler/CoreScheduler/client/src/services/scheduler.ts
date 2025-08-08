import { apiRequest } from "@/lib/queryClient";
import type { SimulationState, ProcessState, NewProcess, Algorithm } from "@/types/simulation";

export const schedulerService = {
  // Process operations
  async createProcess(process: NewProcess): Promise<ProcessState> {
    const response = await apiRequest("POST", "/api/processes", process);
    return response.json();
  },

  async getAllProcesses(): Promise<ProcessState[]> {
    const response = await apiRequest("GET", "/api/processes");
    return response.json();
  },

  async deleteProcess(id: string): Promise<void> {
    await apiRequest("DELETE", `/api/processes/${id}`);
  },

  // Simulation operations
  async createSimulation(data: {
    algorithm: Algorithm;
    timeQuantum?: number;
    contextSwitchOverhead?: number;
    processes: ProcessState[];
  }): Promise<SimulationState> {
    const response = await apiRequest("POST", "/api/simulations", data);
    return response.json();
  },

  async getCurrentSimulation(): Promise<SimulationState> {
    const response = await apiRequest("GET", "/api/simulations/current");
    return response.json();
  },

  async updateSimulation(id: string, updates: Partial<SimulationState>): Promise<SimulationState> {
    const response = await apiRequest("PUT", `/api/simulations/${id}`, updates);
    return response.json();
  },

  // Simulation controls
  async startSimulation(id: string): Promise<SimulationState> {
    const response = await apiRequest("POST", `/api/simulations/${id}/start`);
    return response.json();
  },

  async pauseSimulation(id: string): Promise<SimulationState> {
    const response = await apiRequest("POST", `/api/simulations/${id}/pause`);
    return response.json();
  },

  async resetSimulation(id: string): Promise<SimulationState> {
    const response = await apiRequest("POST", `/api/simulations/${id}/reset`);
    return response.json();
  },

  async stepSimulation(id: string): Promise<SimulationState> {
    const response = await apiRequest("POST", `/api/simulations/${id}/step`);
    return response.json();
  },

  // Export operations
  async exportCSV(id: string): Promise<string> {
    const response = await fetch(`/api/simulations/${id}/export/csv`);
    return response.text();
  },
};
