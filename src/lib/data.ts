// This file acts as a mock in-memory database.
import type { Tool, LogEntry, User } from "@/types";
import { Wrench, ShieldCheck, GitBranch, FileClock } from "lucide-react";

let tools: Tool[] = [
  {
    id: "t1",
    name: "Project Planner",
    description: "A Kanban board for project management.",
    url: "https://trello.com",
    icon: "Wrench",
    enabled: true,
  },
  {
    id: "t2",
    name: "Security Scanner",
    description: "Tool for scanning web vulnerabilities.",
    url: "https://www.ssllabs.com/ssltest/",
    icon: "ShieldCheck",
    enabled: true,
  },
  {
    id: "t3",
    name: "Version Control",
    description: "Git repository management.",
    url: "https://github.com",
    icon: "GitBranch",
    enabled: false,
  },
  {
    id: "t4",
    name: "Time Tracker",
    description: "Log and track work hours.",
    url: "https://toggl.com/track/timer/",
    icon: "FileClock",
    enabled: true,
  },
];

let logs: LogEntry[] = [];

// Simulate fetching data with a delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getTools = async () => {
  await sleep(200);
  return [...tools];
};

export const addTool = async (tool: Omit<Tool, 'id'>, user: User) => {
  await sleep(200);
  const newTool: Tool = { ...tool, id: `t${Date.now()}` };
  tools.unshift(newTool);
  logAction(user, `Created tool: ${newTool.name}`, `ID: ${newTool.id}`);
  return newTool;
};

export const updateTool = async (updatedTool: Tool, user: User) => {
  await sleep(200);
  const index = tools.findIndex(t => t.id === updatedTool.id);
  if (index !== -1) {
    const oldTool = tools[index];
    tools[index] = updatedTool;
    logAction(user, `Updated tool: ${updatedTool.name}`, `Changes: ${JSON.stringify(diff(oldTool, updatedTool))}`);
    return updatedTool;
  }
  return null;
};

export const deleteTool = async (toolId: string, user: User) => {
  await sleep(200);
  const toolToDelete = tools.find(t => t.id === toolId);
  if(toolToDelete) {
    tools = tools.filter(t => t.id !== toolId);
    logAction(user, `Deleted tool: ${toolToDelete.name}`, `ID: ${toolId}`);
  }
};

export const getLogs = async () => {
  await sleep(200);
  return [...logs];
};

const logAction = (user: User, action: string, details: string) => {
  const newLog: LogEntry = {
    id: `l${Date.now()}`,
    timestamp: new Date(),
    adminName: user.name,
    action,
    details,
  };
  logs.unshift(newLog);
};

// Helper to find differences between two objects for logging
const diff = (obj1: any, obj2: any) => {
  return Object.keys(obj1).reduce((result, key) => {
    if (obj2.hasOwnProperty(key) && obj1[key] !== obj2[key]) {
      result[key] = { from: obj1[key], to: obj2[key] };
    }
    return result;
  }, {} as any);
}
