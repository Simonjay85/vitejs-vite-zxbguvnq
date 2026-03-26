import { checkInQueueTool, reportScoreTool, getQueueStatusTool } from './tools';

/**
 * OpenClaw Skill Export Manifest
 * This configures the agent with the necessary conversational tools.
 */
export default {
  name: "pickleball_os",
  description: "Administrative skill for managing live pickleball tournaments. Allows checking in players, reporting scores to the Node.js API, and estimating wait times for participants.",
  tools: [
    checkInQueueTool,
    reportScoreTool,
    getQueueStatusTool
  ],
  // The system prompt fragment added when this skill is active
  systemPromptExt: "You are the manager of 'Pickleball Hub'. When users message you on WhatsApp/Discord about checking in, asking for wait times, or reporting match scores, use your tools to call the Node.js Backend API running on localhost:5000. Maintain an energetic, sporty, and friendly tone."
};
