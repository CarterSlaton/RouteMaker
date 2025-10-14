// Route storage utility using MongoDB API

export interface Route {
  id?: string;
  _id?: string;
  name: string;
  distance: number;
  location: string;
  date: string;
  difficulty: "Easy" | "Moderate" | "Hard";
  coordinates: number[][];
  elevationData?: {
    elevationGain: number;
    elevationLoss: number;
    minElevation: number;
    maxElevation: number;
    profile: Array<{ distance: number; elevation: number }>;
  };
  directions?: Array<{
    instruction: string;
    distance: number;
    type: string;
  }>;
  createdAt?: string | number;
}

const API_URL = "http://localhost:5000/api/routes";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Get all routes from API
export const getRoutes = async (): Promise<Route[]> => {
  try {
    const response = await fetch(API_URL, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error("Failed to fetch routes");
    const routes = await response.json();
    // Transform MongoDB data to match frontend interface
    return routes.map((route: any) => ({
      _id: route._id,
      id: route._id,
      name: route.name,
      distance: route.distance,
      location: "", // Will be populated by frontend
      date: new Date(route.createdAt).toLocaleDateString(),
      difficulty: route.difficulty,
      coordinates: route.coordinates.coordinates,
      elevationData: route.elevationData,
      directions: route.directions,
      createdAt: route.createdAt
    }));
  } catch (error) {
    console.error("Error loading routes:", error);
    return [];
  }
};

// Save a new route
export const saveRoute = async (route: Omit<Route, "id" | "createdAt">): Promise<Route> => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        name: route.name,
        distance: route.distance,
        difficulty: route.difficulty,
        coordinates: route.coordinates,
      }),
    });

    if (!response.ok) throw new Error("Failed to save route");
    const savedRoute = await response.json();
    
    return {
      id: savedRoute._id,
      name: savedRoute.name,
      distance: savedRoute.distance,
      location: route.location,
      date: new Date(savedRoute.createdAt).toLocaleDateString(),
      difficulty: savedRoute.difficulty,
      coordinates: savedRoute.coordinates.coordinates,
      createdAt: savedRoute.createdAt
    };
  } catch (error) {
    console.error("Error saving route:", error);
    throw error;
  }
};

// Delete a route by ID
export const deleteRoute = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return response.ok;
  } catch (error) {
    console.error("Error deleting route:", error);
    return false;
  }
};

// Update an existing route
export const updateRoute = async (id: string, updates: Partial<Route>): Promise<Route | null> => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });

    if (!response.ok) return null;
    const updatedRoute = await response.json();
    
    return {
      id: updatedRoute._id,
      name: updatedRoute.name,
      distance: updatedRoute.distance,
      location: updates.location || "",
      date: new Date(updatedRoute.createdAt).toLocaleDateString(),
      difficulty: updatedRoute.difficulty,
      coordinates: updatedRoute.coordinates.coordinates,
      createdAt: updatedRoute.createdAt
    };
  } catch (error) {
    console.error("Error updating route:", error);
    return null;
  }
};

// Get a single route by ID
export const getRoute = async (id: string): Promise<Route | null> => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) return null;
    const route = await response.json();
    
    return {
      id: route._id,
      name: route.name,
      distance: route.distance,
      location: "",
      date: new Date(route.createdAt).toLocaleDateString(),
      difficulty: route.difficulty,
      coordinates: route.coordinates.coordinates,
      createdAt: route.createdAt
    };
  } catch (error) {
    console.error("Error fetching route:", error);
    return null;
  }
};

// Get route statistics
export const getRouteStats = async () => {
  try {
    const response = await fetch(`${API_URL}/stats/summary`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error("Failed to fetch stats");
    return await response.json();
  } catch (error) {
    console.error("Error fetching stats:", error);
    const routes = await getRoutes();
    return {
      totalRoutes: routes.length,
      totalDistance: routes.reduce((sum, route) => sum + route.distance, 0),
      averageDistance: routes.length > 0 
        ? routes.reduce((sum, route) => sum + route.distance, 0) / routes.length 
        : 0,
    };
  }
};
