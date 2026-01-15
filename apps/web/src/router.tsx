import { createRouter, createRootRoute, createRoute, redirect } from '@tanstack/react-router';
import { FamilyView } from './views/family-view';
import { PlannerView } from './views/planner-view';

// Create the root route
const rootRoute = createRootRoute();

// Create the index route that redirects to /family
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/family' });
  },
});

// Create the family route
const familyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/family',
  component: FamilyView,
});

// Create the planner route
const plannerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/planner',
  component: PlannerView,
});

// Create the route tree
const routeTree = rootRoute.addChildren([indexRoute, familyRoute, plannerRoute]);

// Create the router
export const router = createRouter({ routeTree });

// Register the router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
