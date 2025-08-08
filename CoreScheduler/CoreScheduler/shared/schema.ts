import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const processes = pgTable("processes", {
  id: varchar("id").primaryKey(),
  processId: text("process_id").notNull(),
  arrivalTime: integer("arrival_time").notNull(),
  burstTime: integer("burst_time").notNull(),
  priority: integer("priority").notNull(),
  status: text("status").notNull().default("waiting"), // waiting, ready, running, completed
  remainingTime: integer("remaining_time").notNull(),
  waitingTime: integer("waiting_time").notNull().default(0),
  turnaroundTime: integer("turnaround_time").default(0),
  responseTime: integer("response_time").default(-1),
  completionTime: integer("completion_time").default(0),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const simulations = pgTable("simulations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  algorithm: text("algorithm").notNull(), // rr, priority, fcfs, sjf, srtf
  timeQuantum: integer("time_quantum").default(3),
  contextSwitchOverhead: integer("context_switch_overhead").default(1),
  currentTime: integer("current_time").notNull().default(0),
  status: text("status").notNull().default("stopped"), // running, paused, stopped, completed
  processes: jsonb("processes").notNull().default([]),
  executionHistory: jsonb("execution_history").notNull().default([]),
  metrics: jsonb("metrics").notNull().default({}),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const insertProcessSchema = createInsertSchema(processes).omit({
  id: true,
  createdAt: true,
  status: true,
  remainingTime: true,
  waitingTime: true,
  turnaroundTime: true,
  responseTime: true,
  completionTime: true,
});

export const insertSimulationSchema = createInsertSchema(simulations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  currentTime: true,
  status: true,
  executionHistory: true,
  metrics: true,
});

export const updateSimulationSchema = createInsertSchema(simulations).partial().omit({
  id: true,
  createdAt: true,
});

export type Process = typeof processes.$inferSelect;
export type InsertProcess = z.infer<typeof insertProcessSchema>;
export type Simulation = typeof simulations.$inferSelect;
export type InsertSimulation = z.infer<typeof insertSimulationSchema>;
export type UpdateSimulation = z.infer<typeof updateSimulationSchema>;

// Simulation-specific types
export const SimulationStatusSchema = z.enum(["running", "paused", "stopped", "completed"]);
export const ProcessStatusSchema = z.enum(["waiting", "ready", "running", "completed"]);
export const AlgorithmSchema = z.enum(["rr", "priority", "fcfs", "sjf", "srtf"]);

export type SimulationStatus = z.infer<typeof SimulationStatusSchema>;
export type ProcessStatus = z.infer<typeof ProcessStatusSchema>;
export type Algorithm = z.infer<typeof AlgorithmSchema>;

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
