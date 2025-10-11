import express, { Response } from 'express';
import Route from '../models/Route';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all routes for the authenticated user
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const routes = await Route.find({ userId: req.user!.id }).sort({ createdAt: -1 });
    res.json(routes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching routes', error });
  }
});

// Get a single route by ID (must belong to user)
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const route = await Route.findOne({ _id: req.params.id, userId: req.user!.id });
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }
    res.json(route);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching route', error });
  }
});

// Create a new route
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { name, distance, difficulty, coordinates } = req.body;
    
    // Transform coordinates from [[lng, lat]] to GeoJSON LineString
    const geoJsonCoordinates = {
      type: 'LineString',
      coordinates: coordinates
    };

    const newRoute = new Route({
      userId: req.user!.id,
      name,
      distance,
      difficulty,
      coordinates: geoJsonCoordinates
    });

    const savedRoute = await newRoute.save();
    res.status(201).json(savedRoute);
  } catch (error) {
    res.status(400).json({ message: 'Error creating route', error });
  }
});

// Update a route
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { name, distance, difficulty, coordinates } = req.body;
    
    const updateData: any = { name, distance, difficulty };
    
    if (coordinates) {
      updateData.coordinates = {
        type: 'LineString',
        coordinates: coordinates
      };
    }

    const updatedRoute = await Route.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedRoute) {
      return res.status(404).json({ message: 'Route not found' });
    }

    res.json(updatedRoute);
  } catch (error) {
    res.status(400).json({ message: 'Error updating route', error });
  }
});

// Delete a route
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const deletedRoute = await Route.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user!.id 
    });
    
    if (!deletedRoute) {
      return res.status(404).json({ message: 'Route not found' });
    }

    res.json({ message: 'Route deleted successfully', route: deletedRoute });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting route', error });
  }
});

// Get route statistics
router.get('/stats/summary', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const totalRoutes = await Route.countDocuments({ userId: req.user!.id });
    const routes = await Route.find({ userId: req.user!.id });
    
    const totalDistance = routes.reduce((sum, route) => sum + route.distance, 0);
    const avgDistance = totalRoutes > 0 ? totalDistance / totalRoutes : 0;

    res.json({
      totalRoutes,
      totalDistance: parseFloat(totalDistance.toFixed(2)),
      averageDistance: parseFloat(avgDistance.toFixed(2))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error });
  }
});

export default router;
