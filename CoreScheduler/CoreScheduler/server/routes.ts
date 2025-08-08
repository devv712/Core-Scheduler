import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProcessSchema, insertSimulationSchema, updateSimulationSchema, type ProcessState, type SimulationState, type Algorithm } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Process routes
  app.post("/api/processes", async (req, res) => {
    try {
      const processData = insertProcessSchema.parse(req.body);
      const process = await storage.createProcess(processData);
      res.json(process);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Invalid process data" });
    }
  });

  app.get("/api/processes", async (req, res) => {
    try {
      const processes = await storage.getAllProcesses();
      res.json(processes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch processes" });
    }
  });

  app.delete("/api/processes/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteProcess(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Process not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete process" });
    }
  });

  // Simulation routes
  app.post("/api/simulations", async (req, res) => {
    try {
      const simulationData = insertSimulationSchema.parse(req.body);
      const simulation = await storage.createSimulation(simulationData);
      res.json(simulation);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Invalid simulation data" });
    }
  });

  app.get("/api/simulations/current", async (req, res) => {
    try {
      const simulation = await storage.getCurrentSimulation();
      if (!simulation) {
        return res.status(404).json({ error: "No current simulation found" });
      }
      res.json(simulation);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch current simulation" });
    }
  });

  app.put("/api/simulations/:id", async (req, res) => {
    try {
      const updates = updateSimulationSchema.parse(req.body);
      const simulation = await storage.updateSimulation(req.params.id, updates as Partial<SimulationState>);
      if (!simulation) {
        return res.status(404).json({ error: "Simulation not found" });
      }
      res.json(simulation);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : "Invalid simulation data" });
    }
  });

  // Simulation control routes
  app.post("/api/simulations/:id/start", async (req, res) => {
    try {
      const simulation = await storage.getSimulation(req.params.id);
      if (!simulation) {
        return res.status(404).json({ error: "Simulation not found" });
      }

      // Initialize processes at arrival time 0 to ready status
      const updatedProcesses = simulation.processes.map(p => 
        p.arrivalTime === 0 ? { ...p, status: "ready" as const } : p
      );

      const readyProcesses = updatedProcesses.filter(p => 
        p.arrivalTime <= simulation.currentTime && p.status === "ready"
      );

      const updated = await storage.updateSimulation(req.params.id, {
        status: "running",
        processes: updatedProcesses,
        readyQueue: readyProcesses,
      });

      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to start simulation" });
    }
  });

  app.post("/api/simulations/:id/pause", async (req, res) => {
    try {
      const updated = await storage.updateSimulation(req.params.id, { status: "paused" });
      if (!updated) {
        return res.status(404).json({ error: "Simulation not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to pause simulation" });
    }
  });

  app.post("/api/simulations/:id/reset", async (req, res) => {
    try {
      const simulation = await storage.getSimulation(req.params.id);
      if (!simulation) {
        return res.status(404).json({ error: "Simulation not found" });
      }

      // Reset all processes to initial state
      const resetProcesses = simulation.processes.map(p => ({
        ...p,
        status: "waiting" as const,
        remainingTime: p.burstTime,
        waitingTime: 0,
        turnaroundTime: 0,
        responseTime: -1,
        completionTime: 0,
      }));

      const updated = await storage.updateSimulation(req.params.id, {
        status: "stopped",
        currentTime: 0,
        processes: resetProcesses,
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
      });

      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to reset simulation" });
    }
  });

  app.post("/api/simulations/:id/step", async (req, res) => {
    try {
      const simulation = await storage.getSimulation(req.params.id);
      if (!simulation) {
        return res.status(404).json({ error: "Simulation not found" });
      }

      if (simulation.status !== "running") {
        return res.status(400).json({ error: "Simulation is not running" });
      }

      // Execute one simulation step based on the algorithm
      const updated = await executeSimulationStep(simulation);
      const saved = await storage.updateSimulation(req.params.id, updated);

      res.json(saved);
    } catch (error) {
      res.status(500).json({ error: "Failed to execute simulation step" });
    }
  });

  // Export routes
  app.get("/api/simulations/:id/export/csv", async (req, res) => {
    try {
      const simulation = await storage.getSimulation(req.params.id);
      if (!simulation) {
        return res.status(404).json({ error: "Simulation not found" });
      }

      const csv = generateCSVReport(simulation);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="simulation_${simulation.id}.csv"`);
      res.send(csv);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate CSV export" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function executeSimulationStep(simulation: SimulationState): Promise<Partial<SimulationState>> {
  const { algorithm, processes, currentTime, readyQueue, runningProcess, executionHistory, timeQuantum } = simulation;
  
  // Add arriving processes to ready queue
  const newArrivals = processes.filter(p => 
    p.arrivalTime === currentTime && p.status === "waiting"
  );
  
  const updatedProcesses = processes.map(p => 
    newArrivals.some(na => na.id === p.id) ? { ...p, status: "ready" as const } : p
  );

  let newReadyQueue = [...readyQueue, ...newArrivals];
  let newRunningProcess = runningProcess;
  let newExecutionHistory = [...executionHistory];
  let contextSwitches = simulation.metrics.contextSwitches;

  // Algorithm-specific scheduling logic
  switch (algorithm) {
    case "fcfs":
      if (!newRunningProcess && newReadyQueue.length > 0) {
        newRunningProcess = newReadyQueue.shift()!;
        newRunningProcess.status = "running";
        if (newRunningProcess.responseTime === -1) {
          newRunningProcess.responseTime = currentTime - newRunningProcess.arrivalTime;
        }
      }
      break;

    case "sjf":
      if (!newRunningProcess && newReadyQueue.length > 0) {
        newReadyQueue.sort((a, b) => a.remainingTime - b.remainingTime);
        newRunningProcess = newReadyQueue.shift()!;
        newRunningProcess.status = "running";
        if (newRunningProcess.responseTime === -1) {
          newRunningProcess.responseTime = currentTime - newRunningProcess.arrivalTime;
        }
      }
      break;

    case "priority":
      if (!newRunningProcess && newReadyQueue.length > 0) {
        newReadyQueue.sort((a, b) => a.priority - b.priority);
        newRunningProcess = newReadyQueue.shift()!;
        newRunningProcess.status = "running";
        if (newRunningProcess.responseTime === -1) {
          newRunningProcess.responseTime = currentTime - newRunningProcess.arrivalTime;
        }
      }
      break;

    case "rr":
      if (!newRunningProcess && newReadyQueue.length > 0) {
        newRunningProcess = newReadyQueue.shift()!;
        newRunningProcess.status = "running";
        if (newRunningProcess.responseTime === -1) {
          newRunningProcess.responseTime = currentTime - newRunningProcess.arrivalTime;
        }
      }
      break;

    case "srtf":
      // Preemptive shortest remaining time first
      if (newReadyQueue.length > 0) {
        newReadyQueue.sort((a, b) => a.remainingTime - b.remainingTime);
        const shortestJob = newReadyQueue[0];
        
        if (!newRunningProcess || shortestJob.remainingTime < newRunningProcess.remainingTime) {
          if (newRunningProcess) {
            newRunningProcess.status = "ready";
            newReadyQueue.push(newRunningProcess);
            contextSwitches++;
          }
          newRunningProcess = newReadyQueue.shift()!;
          newRunningProcess.status = "running";
          if (newRunningProcess.responseTime === -1) {
            newRunningProcess.responseTime = currentTime - newRunningProcess.arrivalTime;
          }
        }
      }
      break;
  }

  // Execute running process
  if (newRunningProcess) {
    newRunningProcess.remainingTime--;
    
    // Add execution block
    newExecutionHistory.push({
      processId: newRunningProcess.id,
      startTime: currentTime,
      endTime: currentTime + 1,
    });

    // Check if process completed
    if (newRunningProcess.remainingTime === 0) {
      newRunningProcess.status = "completed";
      newRunningProcess.completionTime = currentTime + 1;
      newRunningProcess.turnaroundTime = newRunningProcess.completionTime - newRunningProcess.arrivalTime;
      newRunningProcess = null;
    } else if (algorithm === "rr") {
      // Check time quantum for Round Robin
      const currentQuantumUsed = newExecutionHistory
        .filter(block => block.processId === newRunningProcess!.id)
        .reduce((sum, block) => {
          const lastContextSwitch = Math.max(
            ...newExecutionHistory
              .filter(b => b.isContextSwitch)
              .map(b => b.endTime),
            0
          );
          return block.startTime >= lastContextSwitch ? sum + 1 : sum;
        }, 0);

      if (currentQuantumUsed >= timeQuantum && newReadyQueue.length > 0) {
        newRunningProcess.status = "ready";
        newReadyQueue.push(newRunningProcess);
        newRunningProcess = null;
        contextSwitches++;
      }
    }
  }

  // Update waiting times for ready queue
  newReadyQueue.forEach(p => p.waitingTime++);

  // Update processes array
  const finalProcesses = updatedProcesses.map(p => {
    if (newRunningProcess && p.id === newRunningProcess.id) return newRunningProcess;
    const queueProcess = newReadyQueue.find(qp => qp.id === p.id);
    if (queueProcess) return queueProcess;
    return p;
  });

  // Calculate metrics
  const completedProcesses = finalProcesses.filter(p => p.status === "completed");
  const metrics = calculateMetrics(finalProcesses, currentTime + 1, contextSwitches);

  // Check if simulation is complete
  const allCompleted = finalProcesses.every(p => p.status === "completed");
  const status = allCompleted ? "completed" : simulation.status;

  return {
    currentTime: currentTime + 1,
    processes: finalProcesses,
    readyQueue: newReadyQueue,
    runningProcess: newRunningProcess,
    executionHistory: newExecutionHistory,
    metrics: { ...metrics, contextSwitches },
    status,
  };
}

function calculateMetrics(processes: ProcessState[], currentTime: number, contextSwitches: number) {
  const completed = processes.filter(p => p.status === "completed");
  const totalProcesses = processes.length;
  
  if (completed.length === 0) {
    return {
      cpuUtilization: 0,
      avgWaitingTime: 0,
      avgTurnaroundTime: 0,
      avgResponseTime: 0,
      throughput: 0,
      contextSwitches,
      totalExecutionTime: currentTime,
      completedProcesses: 0,
    };
  }

  const totalWaitingTime = completed.reduce((sum, p) => sum + p.waitingTime, 0);
  const totalTurnaroundTime = completed.reduce((sum, p) => sum + p.turnaroundTime, 0);
  const totalResponseTime = completed.reduce((sum, p) => sum + Math.max(0, p.responseTime), 0);
  const totalBurstTime = processes.reduce((sum, p) => sum + p.burstTime, 0);

  return {
    cpuUtilization: currentTime > 0 ? (totalBurstTime / currentTime) * 100 : 0,
    avgWaitingTime: totalWaitingTime / completed.length,
    avgTurnaroundTime: totalTurnaroundTime / completed.length,
    avgResponseTime: totalResponseTime / completed.length,
    throughput: currentTime > 0 ? completed.length / currentTime : 0,
    contextSwitches,
    totalExecutionTime: currentTime,
    completedProcesses: completed.length,
  };
}

function generateCSVReport(simulation: SimulationState): string {
  const headers = [
    "Process ID",
    "Arrival Time", 
    "Burst Time",
    "Priority",
    "Status",
    "Remaining Time",
    "Waiting Time",
    "Turnaround Time",
    "Response Time",
    "Completion Time"
  ];

  const rows = simulation.processes.map(p => [
    p.id,
    p.arrivalTime.toString(),
    p.burstTime.toString(), 
    p.priority.toString(),
    p.status,
    p.remainingTime.toString(),
    p.waitingTime.toString(),
    p.turnaroundTime.toString(),
    p.responseTime.toString(),
    p.completionTime?.toString() || "0"
  ]);

  const metricsRows = [
    [""],
    ["Metrics"],
    ["Algorithm", simulation.algorithm],
    ["Time Quantum", simulation.timeQuantum.toString()],
    ["CPU Utilization", `${simulation.metrics.cpuUtilization.toFixed(2)}%`],
    ["Average Waiting Time", simulation.metrics.avgWaitingTime.toFixed(2)],
    ["Average Turnaround Time", simulation.metrics.avgTurnaroundTime.toFixed(2)],
    ["Average Response Time", simulation.metrics.avgResponseTime.toFixed(2)],
    ["Throughput", simulation.metrics.throughput.toFixed(4)],
    ["Context Switches", simulation.metrics.contextSwitches.toString()],
    ["Total Execution Time", simulation.metrics.totalExecutionTime.toString()],
    ["Completed Processes", simulation.metrics.completedProcesses.toString()]
  ];

  return [headers, ...rows, ...metricsRows]
    .map(row => row.join(","))
    .join("\n");
}
