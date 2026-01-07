// Family tools
import { createFamilyTool, getFamilyTool, updateFamilyTool, deleteFamilyTool } from './family-tools';
export { createFamilyTool, getFamilyTool, updateFamilyTool, deleteFamilyTool };

// Member tools
import { createMemberTool, getMembersTool, getMemberTool, getMemberByNameTool, updateMemberTool, deleteMemberTool } from './member-tools';
export { createMemberTool, getMembersTool, getMemberTool, getMemberByNameTool, updateMemberTool, deleteMemberTool };

// Availability tools
import {
  setMemberAvailabilityTool,
  getMemberAvailabilityTool,
  bulkSetMemberAvailabilityTool,
  getFamilyAvailabilityForMealTool,
  setMemberAvailabilityByNameTool,
  bulkSetMemberAvailabilityByNameTool,
} from './availability-tools';
export {
  setMemberAvailabilityTool,
  getMemberAvailabilityTool,
  bulkSetMemberAvailabilityTool,
  getFamilyAvailabilityForMealTool,
  setMemberAvailabilityByNameTool,
  bulkSetMemberAvailabilityByNameTool,
};

// Planner settings tools
import { createPlannerSettingsTool, getPlannerSettingsTool, updatePlannerSettingsTool, parseCronScheduleTool } from './planner-tools';
export { createPlannerSettingsTool, getPlannerSettingsTool, updatePlannerSettingsTool, parseCronScheduleTool };

// Family summary tool
import { getFamilySummaryTool } from './family-summary-tool';
export { getFamilySummaryTool };

// Calendar tool
import { getCurrentDateTool } from './calendar-tools';
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
  deleteMemberTool,
};

/**
 * All planner configuration tools (for Planner Config Agent)
 */
export const plannerConfigTools = {
  getPlannerSettingsTool,
  createPlannerSettingsTool,
  updatePlannerSettingsTool,
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
import { createMealPlanning, getMealPlanning, createMealEvent, updateMealEvent, getMealEvents } from './meal-tools';
export { createMealPlanning, getMealPlanning, createMealEvent, updateMealEvent, getMealEvents };
