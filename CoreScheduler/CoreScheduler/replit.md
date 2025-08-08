# CPU Scheduler Simulator

## Overview

A comprehensive CPU scheduling algorithm simulator built as a full-stack web application for educational and research purposes. This project simulates various CPU scheduling algorithms including Round Robin, Priority Scheduling, First-Come First-Served, Shortest Job First, and Shortest Remaining Time First. The application provides real-time visualization through interactive Gantt charts, detailed performance metrics analysis, and Process Control Block (PCB) views to demonstrate operating system concepts.

The simulator allows users to create custom process workloads, compare algorithm performance across multiple metrics, and visualize execution patterns. It's designed to bridge the gap between theoretical OS concepts and practical understanding through interactive simulations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type-safe component development
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent design
- **Styling**: Tailwind CSS with custom CSS variables for theming and responsive design
- **State Management**: TanStack React Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework for RESTful API endpoints
- **Language**: TypeScript with ES modules for modern JavaScript features
- **API Design**: REST architecture with dedicated routes for process and simulation management
- **Storage Layer**: In-memory storage with interface-based design for future database migration
- **Development Server**: Vite middleware integration for seamless development experience

### Data Storage Solutions
- **Current Implementation**: In-memory storage using Map structures for rapid prototyping
- **Database Schema**: Drizzle ORM with PostgreSQL schema definitions prepared for production deployment
- **Schema Design**: Separate tables for processes and simulations with JSON fields for complex data structures
- **Migration Support**: Drizzle Kit configuration for database schema management

### Authentication and Authorization
- **Current State**: No authentication implemented - designed for educational/demo use
- **Session Management**: Express session configuration prepared with connect-pg-simple for future implementation

### External Service Integrations
- **Database**: Neon Database (PostgreSQL) connection configured via environment variables
- **Development Tools**: Replit integration with banner support and Cartographer plugin for enhanced development experience
- **Font Services**: Google Fonts integration (Inter and JetBrains Mono) for typography
- **Icon Library**: Font Awesome for UI iconography

### Core Simulation Engine
- **Algorithm Support**: Multiple CPU scheduling algorithms with configurable parameters
- **Real-time Execution**: Step-by-step simulation with pause/resume capabilities
- **Metrics Collection**: Comprehensive performance analysis including CPU utilization, waiting times, and throughput
- **Visualization**: Dynamic Gantt chart generation with process execution timeline
- **Export Functionality**: CSV data export and metrics analysis prepared for implementation

### Component Architecture
- **Modular Design**: Separate components for control panels, charts, metrics, and process management
- **Shared Types**: Centralized type definitions for simulation state and process data
- **Service Layer**: Abstracted API calls through dedicated service modules
- **Error Handling**: Toast notifications and comprehensive error boundaries