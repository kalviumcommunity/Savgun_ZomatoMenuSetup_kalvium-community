// @ts-nocheck
// ==========================================
// 1. IMPORTS & DEPENDENCIES
// ==========================================
import { definePrismaConfig } from "prisma/config";

// ==========================================
// 2. PRISMA AGENTS & SKILLS CONFIGURATION
// ==========================================
// Configures developer agent tooling integration (Claude, Cursor, Agents, Devin)
export default definePrismaConfig({
  skills: {
    agents: ["claude", "cursor", "agents", "devin"],
  },
});
