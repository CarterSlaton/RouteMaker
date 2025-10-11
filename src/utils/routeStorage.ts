// Route storage utility using LocalStorage

export interface Route {
  id: string;
  name: string;
  distance: number;
  location: string;
  date: string;
  difficulty: "Easy" | "Moderate" | "Hard";
  coordinates: number[][];
  createdAt: number;
}

const STORAGE_KEY = "routemaker_routes";

// Get all routes from localStorage
export const getRoutes = (): Route[] => {
  try {
    const routes = localStorage.getItem(STORAGE_KEY);
    return routes ? JSON.parse(routes) : [];
  } catch (error) {
    console.error("Error loading routes:", error);
    return [];
  }
};

// Save a new route
export const saveRoute = (route: Omit<Route, "id" | "createdAt">): Route => {
  try {
    const routes = getRoutes();
    const newRoute: Route = {
      ...route,
      id: generateId(),
      createdAt: Date.now(),
    };
    routes.push(newRoute);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(routes));
    return newRoute;
  } catch (error) {
    console.error("Error saving route:", error);
    throw error;
  }
};

// Delete a route by ID
export const deleteRoute = (id: string): boolean => {
  try {
    const routes = getRoutes();
    const filteredRoutes = routes.filter((route) => route.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredRoutes));
    return true;
  } catch (error) {
    console.error("Error deleting route:", error);
    return false;
  }
};

// Update an existing route
export const updateRoute = (id: string, updates: Partial<Route>): Route | null => {
  try {
    const routes = getRoutes();
    const index = routes.findIndex((route) => route.id === id);
    if (index === -1) return null;

    routes[index] = { ...routes[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(routes));
    return routes[index];
  } catch (error) {
    console.error("Error updating route:", error);
    return null;
  }
};

// Get a single route by ID
export const getRoute = (id: string): Route | null => {
  const routes = getRoutes();
  return routes.find((route) => route.id === id) || null;
};

// Generate a unique ID
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Get route statistics
export const getRouteStats = () => {
  const routes = getRoutes();
  return {
    totalRoutes: routes.length,
    totalDistance: routes.reduce((sum, route) => sum + route.distance, 0),
    averageDistance: routes.length > 0 
      ? routes.reduce((sum, route) => sum + route.distance, 0) / routes.length 
      : 0,
    byDifficulty: {
      easy: routes.filter((r) => r.difficulty === "Easy").length,
      moderate: routes.filter((r) => r.difficulty === "Moderate").length,
      hard: routes.filter((r) => r.difficulty === "Hard").length,
    },
  };
};
