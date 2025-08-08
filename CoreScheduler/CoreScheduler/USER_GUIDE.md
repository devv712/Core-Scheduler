# CPU Scheduler Simulator - Step-by-Step User Guide

## Quick Start (Recommended for First Time Users)

### Step 1: Create Sample Simulation
1. Click the **green "Create Sample Simulation"** button
2. This creates a simulation with 4 sample processes already configured

### Step 2: Start the Simulation
1. Look for the **green "Start Simulation"** button in the left control panel
2. Click it to begin the scheduling simulation
3. The simulation will start running automatically

### Step 3: Watch the Results
- **Gantt Chart**: See colored blocks showing when each process runs
- **Performance Metrics**: View CPU utilization, waiting times, and turnaround times
- **Process Control Blocks**: See detailed information about each process

### Step 4: Control the Simulation
- **Pause**: Yellow pause button to stop the simulation
- **Step**: Blue step button to advance one time unit manually
- **Reset**: Gray reset button to start over

## Detailed Instructions

### Creating Your Own Processes

If you want to create custom processes instead of using samples:

1. Click **"Create Empty Simulation"** (blue button)
2. In the Process Management section, click **"Add Process"**
3. Fill in the process details:
   - **Process Name**: Any name (e.g., "Web Browser", "Text Editor")
   - **Arrival Time**: When the process arrives (0 = immediately)
   - **Burst Time**: How long the process needs to run
   - **Priority**: Lower numbers = higher priority (1 = highest)

4. Click **"Add Process"** to save it
5. Repeat to add more processes (recommended: 3-5 processes)

### Changing Scheduling Algorithms

Try different algorithms to compare results:

1. **Round Robin (RR)**: Default, gives each process equal time slices
2. **First Come First Served (FCFS)**: Processes run in arrival order
3. **Shortest Job First (SJF)**: Shortest processes run first
4. **Shortest Remaining Time First (SRTF)**: Preemptive version of SJF
5. **Priority Scheduling**: Higher priority processes run first

### Understanding the Results

#### Gantt Chart
- Each colored bar shows when a process is running
- Different colors represent different processes
- Time axis shows progression from 0 upward

#### Performance Metrics
- **CPU Utilization**: How busy the CPU is (higher = better)
- **Average Waiting Time**: How long processes wait (lower = better)
- **Average Turnaround Time**: Total time from arrival to completion (lower = better)
- **Throughput**: Processes completed per time unit (higher = better)

#### Process Control Blocks (PCB)
Shows detailed information for each process:
- Current status (waiting, ready, running, completed)
- Remaining execution time
- Waiting time accumulated
- Response time (first time scheduled)

### Tips for Getting Good Screenshots

1. **Start with Sample Data**: Use the sample simulation for consistent results
2. **Let it Run**: Allow the simulation to complete for full Gantt chart
3. **Try Different Algorithms**: Compare Round Robin vs Priority Scheduling
4. **Use Step Mode**: Use the Step button to go through slowly for detailed analysis

### Common Issues and Solutions

**Problem**: Start button is disabled
- **Solution**: Make sure you have added at least one process

**Problem**: Nothing happens when clicking Start
- **Solution**: Check that processes have valid arrival times and burst times

**Problem**: Simulation completes too quickly
- **Solution**: Add processes with longer burst times or use manual Step mode

**Problem**: Gantt chart is empty
- **Solution**: Refresh the page and try the sample simulation first

## Example Process Sets for Testing

### Set 1: Basic Round Robin Test
- P1: Arrival=0, Burst=7, Priority=1
- P2: Arrival=1, Burst=4, Priority=2  
- P3: Arrival=2, Burst=2, Priority=3
- P4: Arrival=3, Burst=1, Priority=4

### Set 2: Priority Scheduling Test
- High Priority: Arrival=0, Burst=3, Priority=1
- Medium Priority: Arrival=1, Burst=5, Priority=2
- Low Priority: Arrival=0, Burst=4, Priority=3

### Set 3: Arrival Time Staggered
- Early: Arrival=0, Burst=6, Priority=2
- Later: Arrival=3, Burst=2, Priority=1  
- Latest: Arrival=5, Burst=3, Priority=3

## Taking Screenshots for Reports

1. **Full Interface**: Capture the entire simulator with Gantt chart and metrics
2. **Gantt Chart Detail**: Focus on the execution timeline
3. **Performance Metrics**: Show the calculated statistics
4. **Process Table**: Display the process control blocks
5. **Different Algorithms**: Compare screenshots of same processes with different scheduling algorithms

That's it! You now have everything you need to use the CPU scheduler simulator effectively.