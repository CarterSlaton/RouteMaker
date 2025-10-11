import express, { Request, Response } from 'express';
import Route from '../models/Route';

const router = express.Router();

// Get all routes
router.get('/', async (req: Request, res: Response) => {
  try {
    const routes = await Route.find().sort({ createdAt: -1 });
    res.json(routes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching routes', error });
  }
});

// Get a single route by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }
    res.json(route);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching route', error });
  }
});

// Create a new route
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, distance, difficulty, coordinates } = req.body;
    
    // Transform coordinates from [[lng, lat]] to GeoJSON LineString
    const geoJsonCoordinates = {
      type: 'LineString',
      coordinates: coordinates
    };

    const newRoute = new Route({
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
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { name, distance, difficulty, coordinates } = req.body;
    
    const updateData: any = { name, distance, difficulty };
    
    if (coordinates) {
      updateData.coordinates = {
        type: 'LineString',
        coordinates: coordinates
      };
    }

    const updatedRoute = await Route.findByIdAndUpdate(
      req.params.id,
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
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deletedRoute = await Route.findByIdAndDelete(req.params.id);
    
    if (!deletedRoute) {
      return res.status(404).json({ message: 'Route not found' });
    }

    res.json({ message: 'Route deleted successfully', route: deletedRoute });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting route', error });
  }
});

// Get route statistics
router.get('/stats/summary', async (req: Request, res: Response) => {
  try {
    const totalRoutes = await Route.countDocuments();
    const routes = await Route.find();
    
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
