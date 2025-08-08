# Kernel-Like Process Scheduler Simulator

A C-based simulation of multiple CPU scheduling algorithms, designed to mimic kernel-level process scheduling behavior. This project demonstrates trade-offs between throughput, response time, and fairness by implementing **Round Robin (RR)**, **Priority Scheduling**, and **First-Come, First-Served (FCFS)**.

---

## 📌 Overview
This simulator models how operating systems allocate CPU time to processes and how scheduling decisions affect performance. It includes:
- Multiple scheduling algorithms
- IPC simulation between processes
- Performance benchmarking
- Extensible design to add new policies

---

## ✨ Features
- **Supported Scheduling Algorithms**:
  - First-Come, First-Served (FCFS)
  - Priority Scheduling (non-preemptive)
  - Round Robin (configurable quantum)
- **Kernel-Like Structures**:
  - Process Control Blocks (PCBs)
  - Ready Queue
  - Scheduler Function Hooks
- **Inter-Process Communication (IPC)**:
  - Implemented using **pipes** and **message queues**
- **Performance Metrics**:
  - Average Waiting Time
  - Average Turnaround Time
  - CPU Utilization
  - Throughput
  - Context Switch Count
- **Workload Simulation**:
  - Configurable number of processes
  - Custom burst times, priorities, and arrival patterns
- **Visualization**:
  - Gantt Chart display in terminal
  - CSV output for plotting

---

## 🛠 Architecture
