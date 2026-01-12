import {
  createFamilyTool,
  getFamilyTool,
  updateFamilyTool,
  deleteFamilyTool,
} from './family-tools.js';
export { createFamilyTool, getFamilyTool, updateFamilyTool, deleteFamilyTool };

// Member tools
import {
  createMemberTool,
  getMembersTool,
  getMemberTool,
  getMemberByNameTool,
  updateMemberTool,
  updateMemberByNameTool,
  deleteMemberTool,
} from './member-tools.js';
export {
  createMemberTool,
  getMembersTool,
  getMemberTool,
  getMemberByNameTool,
  updateMemberTool,
  updateMemberByNameTool,
  deleteMemberTool,
};

// Availability tools
import {
  setMemberAvailabilityTool,
  getMemberAvailabilityTool,
  bulkSetMemberAvailabilityTool,
  getFamilyAvailabilityForMealTool,
  setMemberAvailabilityByNameTool,
  bulkSetMemberAvailabilityByNameTool,
} from './availability-tools.js';
export {
  setMemberAvailabilityTool,
  getMemberAvailabilityTool,
  bulkSetMemberAvailabilityTool,
  getFamilyAvailabilityForMealTool,
  setMemberAvailabilityByNameTool,
  bulkSetMemberAvailabilityByNameTool,
};

// Planner settings tools
import {
  createPlannerSettingsTool,
  getPlannerSettingsTool,
  updatePlannerSettingsTool,
  updatePlannerSettingsByFamilyIdTool,
  parseCronScheduleTool,
} from './planner-tools.js';
export {
  createPlannerSettingsTool,
  getPlannerSettingsTool,
  updatePlannerSettingsTool,
  updatePlannerSettingsByFamilyIdTool,
  parseCronScheduleTool,
};

// Family summary tool
import { getFamilySummaryTool } from './family-summary-tool.js';
export { getFamilySummaryTool };

// Calendar tool
import { getCurrentDateTool } from './calendar-tools.js';
export { getCurrentDateTool };

/**
 * All family configuration tools (for Family Config Agent)
 */
export const familyConfigTools = {
  createFamilyTool,
  getFamilyTool,
  updateFamilyTool,
  createMemberTool,
  getMembersTool,
  getMemberTool,
  getMemberByNameTool,
  updateMemberTool,
  updateMemberByNameTool, // Preferred - update by name without needing member ID
  deleteMemberTool,
};

/**
 * All planner configuration tools (for Planner Config Agent)
 */
export const plannerConfigTools = {
  getPlannerSettingsTool,
  createPlannerSettingsTool,
  updatePlannerSettingsTool,
  updatePlannerSettingsByFamilyIdTool, // Preferred - update by familyId without needing settings ID
  parseCronScheduleTool,
  // Name-based tools (preferred - no need to lookup IDs)
  setMemberAvailabilityByNameTool,
  bulkSetMemberAvailabilityByNameTool,
  // ID-based tools (fallback)
  setMemberAvailabilityTool,
  getMemberAvailabilityTool,
  bulkSetMemberAvailabilityTool,
  getFamilyAvailabilityForMealTool,
  getMembersTool, // Needed to list members for availability setup
  getMemberByNameTool, // Lookup member by name
};

// Meal Planner tools
import {
  createMealPlanning,
  getMealPlanning,
  createMealEvent,
  updateMealEvent,
  getMealEvents,
} from './meal-tools.js';
export { createMealPlanning, getMealPlanning, createMealEvent, updateMealEvent, getMealEvents };
