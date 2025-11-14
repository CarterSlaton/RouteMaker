import { Router, Response } from "express";
import Run from "../models/Run";
import Route from "../models/Route";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = Router();

// Start a new run
router.post("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { routeId, startPosition } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Validate route if provided
    let routeName;
    if (routeId) {
      const route = await Route.findOne({ _id: routeId, userId: userId });
      if (!route) {
        return res.status(404).json({ error: "Route not found" });
      }
      routeName = route.name;
    }

    // Create initial GPS point
    const initialGPSPoint = startPosition
      ? {
          latitude: startPosition.latitude,
          longitude: startPosition.longitude,
          timestamp: new Date(),
          accuracy: startPosition.accuracy,
        }
      : undefined;

    const run = new Run({
      user: userId,
      route: routeId || undefined,
      routeName,
      startTime: new Date(),
      status: "active",
      gpsPoints: initialGPSPoint ? [initialGPSPoint] : [],
      statistics: {
        totalDistance: 0,
        totalTime: 0,
        averagePace: 0,
      },
      pausedDuration: 0,
      pauseTimestamps: [],
    });

    await run.save();

    res.status(201).json({
      message: "Run started successfully",
      run: {
        _id: run._id,
        routeId: run.route,
        routeName: run.routeName,
        startTime: run.startTime,
        status: run.status,
        statistics: run.statistics,
      },
    });
  } catch (error: any) {
    console.error("Error starting run:", error);
    res
      .status(500)
      .json({ error: "Failed to start run", details: error.message });
  }
});

// Update run with new GPS points
router.patch("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { gpsPoints, statistics } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const run = await Run.findOne({ _id: id, user: userId });
    
    if (!run) {
      return res.status(404).json({ error: "Run not found" });
    }

    if (run.status !== "active") {
      return res
        .status(400)
        .json({ error: "Can only update active runs" });
    }

    // Add new GPS points
    if (gpsPoints && Array.isArray(gpsPoints)) {
      run.gpsPoints.push(...gpsPoints);
    }

    // Update statistics
    if (statistics) {
      run.statistics = {
        ...run.statistics,
        ...statistics,
      };
    }

    await run.save();

    res.json({
      message: "Run updated successfully",
      statistics: run.statistics,
    });
  } catch (error: any) {
    console.error("Error updating run:", error);
    res
      .status(500)
      .json({ error: "Failed to update run", details: error.message });
  }
});

// Pause a run
router.post("/:id/pause", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const run = await Run.findOne({ _id: id, user: userId });
    
    if (!run) {
      return res.status(404).json({ error: "Run not found" });
    }

    if (run.status !== "active") {
      return res.status(400).json({ error: "Run is not active" });
    }

    run.status = "paused";
    run.pauseTimestamps.push({ pausedAt: new Date() });

    await run.save();

    res.json({
      message: "Run paused successfully",
      status: run.status,
    });
  } catch (error: any) {
    console.error("Error pausing run:", error);
    res
      .status(500)
      .json({ error: "Failed to pause run", details: error.message });
  }
});

// Resume a paused run
router.post("/:id/resume", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const run = await Run.findOne({ _id: id, user: userId });
    
    if (!run) {
      return res.status(404).json({ error: "Run not found" });
    }

    if (run.status !== "paused") {
      return res.status(400).json({ error: "Run is not paused" });
    }

    // Update the last pause timestamp with resume time
    const lastPause = run.pauseTimestamps[run.pauseTimestamps.length - 1];
    if (lastPause && !lastPause.resumedAt) {
      lastPause.resumedAt = new Date();
      const pauseDuration = (lastPause.resumedAt.getTime() - lastPause.pausedAt.getTime()) / 1000;
      run.pausedDuration += pauseDuration;
    }

    run.status = "active";
    await run.save();

    res.json({
      message: "Run resumed successfully",
      status: run.status,
    });
  } catch (error: any) {
    console.error("Error resuming run:", error);
    res
      .status(500)
      .json({ error: "Failed to resume run", details: error.message });
  }
});

// Complete a run
router.put("/:id/complete", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { notes, weather, gpsPoints, statistics } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const run = await Run.findOne({ _id: id, user: userId });
    
    if (!run) {
      return res.status(404).json({ error: "Run not found" });
    }

    if (run.status === "completed") {
      return res.status(400).json({ error: "Run already completed" });
    }

    // Add final GPS points if provided
    if (gpsPoints && Array.isArray(gpsPoints) && gpsPoints.length > 0) {
      console.log(`Saving ${gpsPoints.length} GPS points for run ${id}`);
      run.gpsPoints = gpsPoints; // Replace with all points from frontend
    }

    // Update statistics with final values if provided
    if (statistics) {
      console.log("Saving final statistics:", statistics);
      run.statistics = {
        ...run.statistics,
        ...statistics,
      };
    }

    // If run was paused, calculate final pause duration
    if (run.status === "paused") {
      const lastPause = run.pauseTimestamps[run.pauseTimestamps.length - 1];
      if (lastPause && !lastPause.resumedAt) {
        lastPause.resumedAt = new Date();
        const pauseDuration = (lastPause.resumedAt.getTime() - lastPause.pausedAt.getTime()) / 1000;
        run.pausedDuration += pauseDuration;
      }
    }

    run.status = "completed";
    run.endTime = new Date();
    
    // Only recalculate time if statistics weren't provided
    if (!statistics) {
      const totalTimeWithPauses = (run.endTime.getTime() - run.startTime.getTime()) / 1000;
      run.statistics.totalTime = Math.max(0, totalTimeWithPauses - run.pausedDuration);
      
      if (run.statistics.totalDistance > 0 && run.statistics.totalTime > 0) {
        // Average pace in minutes per km
        run.statistics.averagePace = (run.statistics.totalTime / 60) / run.statistics.totalDistance;
      }
    }

    if (notes) run.notes = notes;
    if (weather) run.weather = weather;

    await run.save();

    res.json({
      message: "Run completed successfully",
      run: {
        _id: run._id,
        routeName: run.routeName,
        startTime: run.startTime,
        endTime: run.endTime,
        status: run.status,
        statistics: run.statistics,
        pausedDuration: run.pausedDuration,
      },
    });
  } catch (error: any) {
    console.error("Error completing run:", error);
    res
      .status(500)
      .json({ error: "Failed to complete run", details: error.message });
  }
});

// Get user's run history
router.get("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { status, limit = 50, skip = 0 } = req.query;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const query: any = { user: userId };
    if (status) {
      query.status = status;
    }

    const runs = await Run.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip))
      .select("-gpsPoints") // Don't send all GPS points for list view
      .populate("route", "name");

    const totalRuns = await Run.countDocuments(query);

    res.json({
      runs,
      totalRuns,
      hasMore: Number(skip) + runs.length < totalRuns,
    });
  } catch (error: any) {
    console.error("Error fetching runs:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch runs", details: error.message });
  }
});

// Get a specific run with full GPS data
router.get("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const run = await Run.findOne({ _id: id, user: userId }).populate(
      "route",
      "name coordinates"
    );

    if (!run) {
      return res.status(404).json({ error: "Run not found" });
    }

    res.json({ run });
  } catch (error: any) {
    console.error("Error fetching run:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch run", details: error.message });
  }
});

// Delete a run
router.delete("/:id", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const run = await Run.findOneAndDelete({ _id: id, user: userId });

    if (!run) {
      return res.status(404).json({ error: "Run not found" });
    }

    res.json({ message: "Run deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting run:", error);
    res
      .status(500)
      .json({ error: "Failed to delete run", details: error.message });
  }
});

export default router;
