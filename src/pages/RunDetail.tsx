import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Icon,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Text,
  VStack,
  useColorModeValue,
  Badge,
  Divider,
  Spinner,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import {
  FaArrowLeft,
  FaRunning,
  FaCalendarAlt,
  FaClock,
  FaTachometerAlt,
  FaRoute,
  FaFire,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { useDistanceUnit } from "../utils/useDistanceUnit";
import { formatTime, formatPace } from "../utils/gpsTracking";
import { API_BASE_URL } from "../config/api";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

interface RunDetail {
  _id: string;
  route?: {
    _id: string;
    name: string;
    distance: number;
  };
  routeName?: string;
  startTime: string;
  endTime?: string;
  status: "active" | "paused" | "completed" | "cancelled";
  statistics: {
    totalDistance: number;
    totalTime: number;
    averagePace: number;
    currentPace?: number;
    calories?: number;
  };
  gpsPoints: Array<{
    latitude: number;
    longitude: number;
    timestamp: string;
    accuracy: number;
  }>;
  pausedDuration: number;
  pauseTimestamps: Array<{ pausedAt: string; resumedAt?: string }>;
  notes?: string;
  createdAt: string;
}

const RunDetail = () => {
  const { runId } = useParams<{ runId: string }>();
  const navigate = useNavigate();
  const { formatDistance, preferredUnit } = useDistanceUnit();
  const paceUnit = preferredUnit === "mi" ? "min/mi" : "min/km";

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  const [run, setRun] = useState<RunDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headingColor = useColorModeValue("gray.800", "white");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const labelColor = useColorModeValue("gray.600", "gray.400");

  // Fetch run details
  useEffect(() => {
    const fetchRun = async () => {
      if (!runId) return;

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${API_BASE_URL}/api/runs/${runId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch run");
        }

        const data = await response.json();
        console.log("Fetched run data:", data);
        setRun(data);
      } catch (error: any) {
        console.error("Error fetching run:", error);
        navigate("/runs");
      } finally {
        setLoading(false);
      }
    };

    fetchRun();
  }, [runId, navigate]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !run || map.current) return;

    // Check if gpsPoints exists and is an array
    if (
      !run.gpsPoints ||
      !Array.isArray(run.gpsPoints) ||
      run.gpsPoints.length === 0
    ) {
      console.log("No GPS points available for this run");
      return;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const coordinates = run.gpsPoints.map((point) => [
      point.longitude,
      point.latitude,
    ]);

    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: coordinates[0] as [number, number],
      zoom: 15,
    });

    mapInstance.on("load", () => {
      // Add GPS path line
      mapInstance.addSource("gps-path", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: coordinates,
          },
        },
      });

      mapInstance.addLayer({
        id: "gps-path-line",
        type: "line",
        source: "gps-path",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#3182CE",
          "line-width": 5,
        },
      });

      // Add start marker
      new mapboxgl.Marker({ color: "#38A169" })
        .setLngLat(coordinates[0] as [number, number])
        .setPopup(new mapboxgl.Popup().setHTML("<strong>Start</strong>"))
        .addTo(mapInstance);

      // Add end marker
      if (coordinates.length > 1) {
        new mapboxgl.Marker({ color: "#E53E3E" })
          .setLngLat(coordinates[coordinates.length - 1] as [number, number])
          .setPopup(new mapboxgl.Popup().setHTML("<strong>Finish</strong>"))
          .addTo(mapInstance);
      }

      // Fit bounds to path
      const bounds = new mapboxgl.LngLatBounds();
      coordinates.forEach((coord) => bounds.extend(coord as [number, number]));
      mapInstance.fitBounds(bounds, { padding: 50 });
    });

    map.current = mapInstance;

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [run]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "green";
      case "active":
        return "blue";
      case "paused":
        return "yellow";
      case "cancelled":
        return "red";
      default:
        return "gray";
    }
  };

  if (loading) {
    return (
      <Container maxW="container.xl" py={20} textAlign="center">
        <Spinner size="xl" color="teal.500" />
        <Text mt={4} color={textColor}>
          Loading run details...
        </Text>
      </Container>
    );
  }

  if (!run) {
    return (
      <Container maxW="container.xl" py={20} textAlign="center">
        <Text color={textColor}>Run not found</Text>
        <Button mt={4} onClick={() => navigate("/runs")}>
          Back to Runs
        </Button>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <HStack>
            <Button
              leftIcon={<FaArrowLeft />}
              variant="ghost"
              onClick={() => navigate("/runs")}
            >
              Back
            </Button>
            <Heading size="lg" color={headingColor}>
              <Icon as={FaRunning} mr={2} color="teal.500" />
              {run.route?.name || run.routeName || "Run Details"}
            </Heading>
          </HStack>
          <Badge colorScheme={getStatusColor(run.status)} fontSize="md" px={3}>
            {run.status}
          </Badge>
        </Flex>

        {/* Date/Time Info */}
        <Box
          bg={cardBg}
          p={6}
          borderRadius="xl"
          border="1px"
          borderColor={borderColor}
        >
          <HStack spacing={6} color={textColor}>
            <HStack>
              <Icon as={FaCalendarAlt} />
              <Text fontWeight="medium">{formatDate(run.startTime)}</Text>
            </HStack>
            {run.pauseTimestamps && run.pauseTimestamps.length > 0 && (
              <Text fontSize="sm">
                Paused {run.pauseTimestamps.length} time
                {run.pauseTimestamps.length > 1 ? "s" : ""}
              </Text>
            )}
          </HStack>
        </Box>

        {/* Statistics Grid */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <Box
            bg={cardBg}
            p={6}
            borderRadius="xl"
            border="1px"
            borderColor={borderColor}
          >
            <Stat>
              <StatLabel color={labelColor}>
                <Icon as={FaRoute} mr={2} />
                Distance
              </StatLabel>
              <StatNumber color="teal.500" fontSize="3xl">
                {formatDistance(run.statistics?.totalDistance || 0)}
              </StatNumber>
              <StatHelpText color={textColor}>Total</StatHelpText>
            </Stat>
          </Box>

          <Box
            bg={cardBg}
            p={6}
            borderRadius="xl"
            border="1px"
            borderColor={borderColor}
          >
            <Stat>
              <StatLabel color={labelColor}>
                <Icon as={FaClock} mr={2} />
                Time
              </StatLabel>
              <StatNumber color="teal.500" fontSize="3xl">
                {formatTime(run.statistics?.totalTime || 0)}
              </StatNumber>
              <StatHelpText color={textColor}>Active</StatHelpText>
            </Stat>
          </Box>

          <Box
            bg={cardBg}
            p={6}
            borderRadius="xl"
            border="1px"
            borderColor={borderColor}
          >
            <Stat>
              <StatLabel color={labelColor}>
                <Icon as={FaTachometerAlt} mr={2} />
                Avg Pace
              </StatLabel>
              <StatNumber color="teal.500" fontSize="3xl">
                {formatPace(run.statistics?.averagePace || 0)}
              </StatNumber>
              <StatHelpText color={textColor}>{paceUnit}</StatHelpText>
            </Stat>
          </Box>

          <Box
            bg={cardBg}
            p={6}
            borderRadius="xl"
            border="1px"
            borderColor={borderColor}
          >
            <Stat>
              <StatLabel color={labelColor}>
                <Icon as={FaFire} mr={2} />
                Calories
              </StatLabel>
              <StatNumber color="teal.500" fontSize="3xl">
                {run.statistics?.calories
                  ? Math.round(run.statistics.calories)
                  : "--"}
              </StatNumber>
              <StatHelpText color={textColor}>kcal</StatHelpText>
            </Stat>
          </Box>
        </SimpleGrid>

        {/* Map */}
        <Box
          bg={cardBg}
          p={4}
          borderRadius="xl"
          border="1px"
          borderColor={borderColor}
        >
          <Heading size="md" color={headingColor} mb={4}>
            <Icon as={FaMapMarkerAlt} mr={2} />
            GPS Path
          </Heading>
          {run.gpsPoints && run.gpsPoints.length > 0 ? (
            <>
              <Box
                ref={mapContainer}
                height="500px"
                borderRadius="lg"
                overflow="hidden"
              />
              <Text mt={2} fontSize="sm" color={textColor}>
                {run.gpsPoints.length} GPS points recorded
              </Text>
            </>
          ) : (
            <Box
              height="500px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              bg={useColorModeValue("gray.50", "gray.900")}
              borderRadius="lg"
            >
              <VStack>
                <Icon as={FaMapMarkerAlt} boxSize={12} color="gray.400" />
                <Text color={textColor}>
                  No GPS data available for this run
                </Text>
              </VStack>
            </Box>
          )}
        </Box>

        {/* Notes */}
        {run.notes && (
          <Box
            bg={cardBg}
            p={6}
            borderRadius="xl"
            border="1px"
            borderColor={borderColor}
          >
            <Heading size="md" color={headingColor} mb={3}>
              Notes
            </Heading>
            <Divider mb={3} />
            <Text color={textColor}>{run.notes}</Text>
          </Box>
        )}
      </VStack>
    </Container>
  );
};

export default RunDetail;
