import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Text,
  VStack,
  useColorModeValue,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import {
  FaPlay,
  FaPause,
  FaStop,
  FaRunning,
  FaCrosshairs,
} from "react-icons/fa";
import {
  gpsTracker,
  type GPSPosition,
  RunStatisticsCalculator,
  formatPace,
  formatTime,
} from "../utils/gpsTracking";
import { useDistanceUnit } from "../utils/useDistanceUnit";
import { useAuth } from "../contexts/AuthContext";
import { API_BASE_URL } from "../config/api";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

interface Route {
  _id: string;
  name: string;
  coordinates: {
    type: string;
    coordinates: [number, number][];
  };
  distance: number;
}

const RunRoute = () => {
  const { routeId } = useParams<{ routeId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const { formatDistance, preferredUnit } = useDistanceUnit();
  const paceUnit = preferredUnit === "mi" ? "min/mi" : "min/km";

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const routeLineRef = useRef<string | null>(null);
  const userPathLineRef = useRef<string | null>(null);

  const [route, setRoute] = useState<Route | null>(null);
  const [runId, setRunId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [statistics, setStatistics] = useState({
    distance: 0,
    time: 0,
    currentPace: 0,
    averagePace: 0,
  });
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [userPath, setUserPath] = useState<[number, number][]>([]);
  const [followMode, setFollowMode] = useState(true); // Auto-follow user location

  const statsCalculator = useRef<RunStatisticsCalculator | null>(null);
  const updateInterval = useRef<number | null>(null);

  const borderColor = useColorModeValue("gray.200", "gray.700");
  const statBgColor = useColorModeValue("gray.50", "gray.700");
  const labelColor = useColorModeValue("gray.600", "gray.400");
  const numberColor = useColorModeValue("gray.900", "white");
  const helpTextColor = useColorModeValue("gray.500", "gray.400");
  const headingColor = useColorModeValue("gray.800", "gray.100");

  // Fetch route details
  useEffect(() => {
    const fetchRoute = async () => {
      if (!routeId) return;

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/api/routes/${routeId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch route");
        }

        const data = await response.json();
        setRoute(data);
      } catch (error: any) {
        console.error("Error fetching route:", error);
        toast({
          title: "Error",
          description: "Failed to load route",
          status: "error",
          duration: 4000,
        });
        navigate("/my-routes");
      }
    };

    fetchRoute();
  }, [routeId, navigate, toast]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !route || map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: route.coordinates.coordinates[0],
      zoom: 15,
    });

    mapInstance.on("load", () => {
      // Add route line
      mapInstance.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: route.coordinates.coordinates,
          },
        },
      });

      mapInstance.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#888",
          "line-width": 4,
          "line-dasharray": [2, 2],
        },
      });

      routeLineRef.current = "route-line";

      // Add user path line (empty initially)
      mapInstance.addSource("user-path", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: [],
          },
        },
      });

      mapInstance.addLayer({
        id: "user-path-line",
        type: "line",
        source: "user-path",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#3182CE",
          "line-width": 5,
        },
      });

      userPathLineRef.current = "user-path-line";

      // Fit bounds to route
      const bounds = new mapboxgl.LngLatBounds();
      route.coordinates.coordinates.forEach((coord: [number, number]) =>
        bounds.extend(coord)
      );
      mapInstance.fitBounds(bounds, { padding: 50 });
    });

    // Disable follow mode when user drags the map
    mapInstance.on("dragstart", () => {
      setFollowMode(false);
    });

    map.current = mapInstance;

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [route, user]);

  // Handle GPS position updates
  const handlePositionUpdate = (position: GPSPosition) => {
    setGpsError(null);

    if (!statsCalculator.current || !isRunning || isPaused) return;

    // Add position to statistics calculator
    statsCalculator.current.addPosition(position);

    // Update user path
    const newPath: [number, number][] = [
      ...userPath,
      [position.longitude, position.latitude] as [number, number],
    ];
    setUserPath(newPath);

    // Update user marker on map
    if (map.current) {
      if (!userMarker.current) {
        // Create custom marker element
        const el = document.createElement("div");
        el.className = "user-location-marker";
        el.style.width = "40px";
        el.style.height = "40px";
        el.style.borderRadius = "50%";
        el.style.backgroundColor = "#3182CE";
        el.style.border = "4px solid white";
        el.style.boxShadow = "0 0 10px rgba(0,0,0,0.3)";
        el.style.display = "flex";
        el.style.alignItems = "center";
        el.style.justifyContent = "center";
        el.style.fontSize = "20px";
        el.innerHTML = "🏃";

        userMarker.current = new mapboxgl.Marker({
          element: el,
        })
          .setLngLat([position.longitude, position.latitude])
          .addTo(map.current);
      } else {
        userMarker.current.setLngLat([position.longitude, position.latitude]);
      }

      // Update user path line
      const source = map.current.getSource(
        "user-path"
      ) as mapboxgl.GeoJSONSource;
      if (source) {
        source.setData({
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: newPath,
          },
        });
      }

      // Center map on user if follow mode is enabled
      if (followMode) {
        map.current.easeTo({
          center: [position.longitude, position.latitude],
          zoom: 17,
          duration: 1000,
        });
      }
    }

    // Send position update to backend every 10 points
    if (newPath.length % 10 === 0 && runId) {
      sendPositionUpdate();
    }
  };

  const handleGPSError = (error: GeolocationPositionError) => {
    let errorMessage = "GPS error occurred";

    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage =
          "Location permission denied. Please enable location access.";
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage =
          "Location information unavailable. Check your GPS signal.";
        break;
      case error.TIMEOUT:
        errorMessage = "Location request timed out. Try again.";
        break;
    }

    setGpsError(errorMessage);
    toast({
      title: "GPS Error",
      description: errorMessage,
      status: "error",
      duration: 5000,
    });
  };

  // Start run
  const handleStart = async () => {
    try {
      // Get initial position
      const initialPosition = await gpsTracker.getCurrentPosition();

      // Start run on backend
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/runs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          routeId: routeId || null,
          startPosition: initialPosition,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to start run");
      }

      const data = await response.json();
      setRunId(data.run._id);

      // Initialize statistics calculator
      statsCalculator.current = new RunStatisticsCalculator(Date.now());
      statsCalculator.current.addPosition(initialPosition);

      // Start GPS tracking
      const started = gpsTracker.startTracking(
        handlePositionUpdate,
        handleGPSError
      );

      if (!started) {
        throw new Error("Failed to start GPS tracking");
      }

      setIsRunning(true);
      setHasStarted(true);
      setIsPaused(false);

      // Start statistics update interval
      updateInterval.current = window.setInterval(() => {
        if (statsCalculator.current) {
          const stats = statsCalculator.current.getStatistics();
          setStatistics({
            distance: stats.totalDistance,
            time: stats.totalTime,
            currentPace: stats.currentPace,
            averagePace: stats.averagePace,
          });
        }
      }, 1000);

      toast({
        title: "Run Started!",
        description: "GPS tracking is now active",
        status: "success",
        duration: 3000,
      });
    } catch (error: any) {
      console.error("Error starting run:", error);
      toast({
        title: "Failed to Start",
        description: error.message,
        status: "error",
        duration: 4000,
      });
    }
  };

  // Pause run
  const handlePause = async () => {
    if (!runId || !statsCalculator.current) return;

    try {
      statsCalculator.current.pause();
      gpsTracker.stopTracking();
      setIsPaused(true);
      setIsRunning(false);

      const token = localStorage.getItem("token");
      await fetch(`${API_BASE_URL}/api/runs/${runId}/pause`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast({
        title: "Run Paused",
        status: "info",
        duration: 2000,
      });
    } catch (error: any) {
      console.error("Error pausing run:", error);
    }
  };

  // Resume run
  const handleResume = async () => {
    if (!runId || !statsCalculator.current) return;

    try {
      statsCalculator.current.resume();
      gpsTracker.startTracking(handlePositionUpdate, handleGPSError);
      setIsPaused(false);
      setIsRunning(true);

      const token = localStorage.getItem("token");
      await fetch(`${API_BASE_URL}/api/runs/${runId}/resume`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast({
        title: "Run Resumed",
        status: "success",
        duration: 2000,
      });
    } catch (error: any) {
      console.error("Error resuming run:", error);
    }
  };

  // Send position update to backend
  const sendPositionUpdate = async () => {
    if (!runId || !statsCalculator.current) return;

    try {
      const token = localStorage.getItem("token");
      const stats = statsCalculator.current.getStatistics();
      const positions = statsCalculator.current.getPositions();

      await fetch(`${API_BASE_URL}/api/runs/${runId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          gpsPoints: positions.slice(-10).map((p) => ({
            latitude: p.latitude,
            longitude: p.longitude,
            timestamp: new Date(p.timestamp),
            accuracy: p.accuracy,
          })),
          statistics: {
            totalDistance: stats.totalDistance,
            totalTime: stats.totalTime,
            averagePace: stats.averagePace,
            currentPace: stats.currentPace,
          },
        }),
      });
    } catch (error: any) {
      console.error("Error updating run:", error);
    }
  };

  // Stop run
  const handleStop = async () => {
    if (!runId) {
      console.log("No runId found, cannot stop run");
      toast({
        title: "Error",
        description: "No active run found",
        status: "error",
        duration: 4000,
      });
      return;
    }

    console.log("Stopping run with ID:", runId);

    try {
      gpsTracker.stopTracking();

      if (updateInterval.current) {
        clearInterval(updateInterval.current);
        updateInterval.current = null;
      }

      // Complete run on backend
      const token = localStorage.getItem("token");
      console.log(
        "Sending complete request to:",
        `${API_BASE_URL}/api/runs/${runId}/complete`
      );

      const response = await fetch(
        `${API_BASE_URL}/api/runs/${runId}/complete`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(errorData.error || "Failed to complete run");
      }

      const data = await response.json();
      console.log("Run completed successfully:", data);

      toast({
        title: "Run Completed!",
        description: `Distance: ${formatDistance(
          data.run.statistics.totalDistance
        )}, Time: ${formatTime(data.run.statistics.totalTime)}`,
        status: "success",
        duration: 5000,
      });

      // Navigate to run history or route details
      setTimeout(() => {
        navigate("/runs");
      }, 2000);
    } catch (error: any) {
      console.error("Error stopping run:", error);
      toast({
        title: "Error",
        description: "Failed to complete run",
        status: "error",
        duration: 4000,
      });
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gpsTracker.isActive()) {
        gpsTracker.stopTracking();
      }
      if (updateInterval.current) {
        clearInterval(updateInterval.current);
      }
    };
  }, []);

  return (
    <Container maxW="container.xl" py={6}>
      <VStack spacing={6} align="stretch">
        <Flex justify="space-between" align="center">
          <Heading size="lg" color={headingColor}>
            <Icon as={FaRunning} mr={2} color="teal.500" />
            {route?.name || "Run Tracking"}
          </Heading>
          <Button variant="ghost" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        </Flex>

        {gpsError && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <Box>
              <AlertTitle>GPS Error</AlertTitle>
              <AlertDescription>{gpsError}</AlertDescription>
            </Box>
          </Alert>
        )}

        {/* Statistics Cards */}
        <HStack spacing={4} justify="space-between">
          <Box
            bg={statBgColor}
            p={4}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={borderColor}
            flex={1}
          >
            <Stat>
              <StatLabel color={labelColor}>Distance</StatLabel>
              <StatNumber fontSize="2xl" color={numberColor}>
                {formatDistance(statistics.distance)}
              </StatNumber>
              <StatHelpText color={helpTextColor}>Total</StatHelpText>
            </Stat>
          </Box>

          <Box
            bg={statBgColor}
            p={4}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={borderColor}
            flex={1}
          >
            <Stat>
              <StatLabel color={labelColor}>Time</StatLabel>
              <StatNumber fontSize="2xl" color={numberColor}>
                {formatTime(statistics.time)}
              </StatNumber>
              <StatHelpText color={helpTextColor}>Active</StatHelpText>
            </Stat>
          </Box>

          <Box
            bg={statBgColor}
            p={4}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={borderColor}
            flex={1}
          >
            <Stat>
              <StatLabel color={labelColor}>Current Pace</StatLabel>
              <StatNumber fontSize="2xl" color={numberColor}>
                {formatPace(statistics.currentPace)}
              </StatNumber>
              <StatHelpText color={helpTextColor}>{paceUnit}</StatHelpText>
            </Stat>
          </Box>

          <Box
            bg={statBgColor}
            p={4}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={borderColor}
            flex={1}
          >
            <Stat>
              <StatLabel color={labelColor}>Avg Pace</StatLabel>
              <StatNumber fontSize="2xl" color={numberColor}>
                {formatPace(statistics.averagePace)}
              </StatNumber>
              <StatHelpText color={helpTextColor}>{paceUnit}</StatHelpText>
            </Stat>
          </Box>
        </HStack>

        {/* Map */}
        <Box position="relative">
          <Box
            ref={mapContainer}
            height="500px"
            borderRadius="lg"
            overflow="hidden"
            borderWidth="1px"
            borderColor={borderColor}
          />

          {/* Follow Mode Button */}
          {hasStarted && (
            <Button
              position="absolute"
              top={4}
              right={4}
              leftIcon={<FaCrosshairs />}
              colorScheme={followMode ? "blue" : "gray"}
              onClick={() => {
                const newFollowMode = !followMode;
                setFollowMode(newFollowMode);

                // If enabling follow mode, immediately center on user
                if (newFollowMode && map.current && userMarker.current) {
                  const lngLat = userMarker.current.getLngLat();
                  map.current.easeTo({
                    center: [lngLat.lng, lngLat.lat],
                    zoom: 17,
                    duration: 1000,
                  });
                }

                toast({
                  title: newFollowMode ? "Follow Mode On" : "Follow Mode Off",
                  description: newFollowMode
                    ? "Map will track your position"
                    : "You can pan the map freely",
                  status: "info",
                  duration: 2000,
                });
              }}
              size="sm"
              boxShadow="lg"
            >
              {followMode ? "Following" : "Follow"}
            </Button>
          )}
        </Box>

        {/* Control Buttons */}
        <HStack spacing={4} justify="center">
          {!hasStarted && (
            <Button
              leftIcon={<FaPlay />}
              colorScheme="green"
              size="lg"
              onClick={handleStart}
              isDisabled={!route}
            >
              Start Run
            </Button>
          )}

          {hasStarted && !isPaused && isRunning && (
            <>
              <Button
                leftIcon={<FaPause />}
                colorScheme="yellow"
                size="lg"
                onClick={handlePause}
              >
                Pause
              </Button>
              <Button
                leftIcon={<FaStop />}
                colorScheme="red"
                size="lg"
                onClick={handleStop}
              >
                Stop Run
              </Button>
            </>
          )}

          {isPaused && (
            <>
              <Button
                leftIcon={<FaPlay />}
                colorScheme="green"
                size="lg"
                onClick={handleResume}
              >
                Resume
              </Button>
              <Button
                leftIcon={<FaStop />}
                colorScheme="red"
                size="lg"
                onClick={handleStop}
              >
                Stop Run
              </Button>
            </>
          )}
        </HStack>

        {hasStarted && (
          <Text textAlign="center" fontSize="sm" color="gray.500">
            {isRunning ? "🟢 Tracking active" : "⏸️ Paused"}
            {" • "}
            {userPath.length} GPS points recorded
          </Text>
        )}
      </VStack>
    </Container>
  );
};

export default RunRoute;
