import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Heading,
  Box,
  Text,
  Button,
  VStack,
  HStack,
  Icon,
  useColorModeValue,
  Badge,
  Flex,
  Divider,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useToast,
  Spinner,
  Stack,
  SimpleGrid,
} from "@chakra-ui/react";
import {
  FaRoute,
  FaCalendarAlt,
  FaArrowLeft,
  FaTrash,
  FaRuler,
  FaTachometerAlt,
} from "react-icons/fa";
import mapboxgl from "mapbox-gl";
import { getRoutes, deleteRoute, type Route } from "../utils/routeStorage";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

const RouteDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [route, setRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const gradientBg = useColorModeValue(
    "linear(to-r, teal.500, blue.500)",
    "linear(to-r, teal.200, blue.200)"
  );
  const textColor = useColorModeValue("gray.600", "gray.300");
  const accentBg = useColorModeValue("teal.50", "teal.900");

  // Load route data
  useEffect(() => {
    const loadRoute = async () => {
      try {
        const routes = await getRoutes();
        const foundRoute = routes.find((r: Route) => {
          const routeId = "_id" in r ? r._id : r.id;
          return routeId === id;
        });
        if (foundRoute) {
          setRoute(foundRoute);
        } else {
          toast({
            title: "Route not found",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          navigate("/my-routes");
        }
      } catch (error) {
        toast({
          title: "Error loading route",
          description: "Failed to load route details",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    loadRoute();
  }, [id, navigate, toast]);

  // Initialize map
  useEffect(() => {
    if (!route || !mapContainer.current || map.current) return;

    // Check if Mapbox token is available
    if (!mapboxgl.accessToken) {
      toast({
        title: "Configuration Error",
        description:
          "Mapbox access token is missing. Please check your .env file.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: route.coordinates[0] as [number, number],
        zoom: 13,
      });
    } catch (error) {
      console.error("Map initialization error:", error);
      toast({
        title: "Map Error",
        description: "Failed to initialize map. Please refresh the page.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    map.current.on("load", () => {
      if (!map.current || !route) return;

      // Add the route line
      map.current.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: route.coordinates,
          },
        },
      });

      map.current.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#0080ff",
          "line-width": 4,
        },
      });

      // Add start marker
      new mapboxgl.Marker({ color: "#00ff00" })
        .setLngLat(route.coordinates[0] as [number, number])
        .addTo(map.current);

      // Add end marker
      const lastCoord = route.coordinates[route.coordinates.length - 1];
      new mapboxgl.Marker({ color: "#ff0000" })
        .setLngLat(lastCoord as [number, number])
        .addTo(map.current);

      // Fit map to route bounds
      const bounds = new mapboxgl.LngLatBounds();
      route.coordinates.forEach((coord: number[]) => {
        bounds.extend(coord as [number, number]);
      });
      map.current.fitBounds(bounds, { padding: 50 });
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [route]);

  const handleDelete = async () => {
    if (!route || !route._id) return;

    try {
      await deleteRoute(route._id);
      toast({
        title: "Route deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      navigate("/my-routes");
    } catch (error) {
      toast({
        title: "Error deleting route",
        description: "Failed to delete route",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    onClose();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "green";
      case "Moderate":
        return "yellow";
      case "Hard":
        return "red";
      default:
        return "gray";
    }
  };

  const formatDate = (dateString?: string | number) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <Box
        minH="calc(100vh - 60px)"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack spacing={4}>
          <Spinner size="xl" color="teal.500" thickness="4px" />
          <Text color={textColor}>Loading route details...</Text>
        </VStack>
      </Box>
    );
  }

  if (!route) {
    return null;
  }

  return (
    <Box
      bg={useColorModeValue("gray.50", "gray.900")}
      minH="calc(100vh - 60px)"
      py={8}
    >
      <Container maxW="container.xl" px={{ base: 4, md: 8 }}>
        <VStack spacing={8} align="stretch">
          {/* Back Button */}
          <Button
            leftIcon={<Icon as={FaArrowLeft} />}
            variant="ghost"
            colorScheme="teal"
            onClick={() => navigate("/my-routes")}
            alignSelf="flex-start"
          >
            Back to My Routes
          </Button>

          {/* Route Header */}
          <Box
            bg={cardBg}
            p={8}
            borderRadius="2xl"
            border="1px"
            borderColor={borderColor}
            boxShadow="xl"
          >
            <Flex
              direction={{ base: "column", md: "row" }}
              justify="space-between"
              align={{ base: "start", md: "center" }}
              gap={4}
            >
              <VStack align="start" spacing={3} flex={1}>
                <Heading size="xl" bgGradient={gradientBg} bgClip="text">
                  {route.name}
                </Heading>
                <HStack spacing={4} flexWrap="wrap">
                  <Badge
                    colorScheme={getDifficultyColor(route.difficulty)}
                    fontSize="md"
                    px={3}
                    py={1}
                    borderRadius="md"
                  >
                    {route.difficulty}
                  </Badge>
                  <HStack color={textColor}>
                    <Icon as={FaCalendarAlt} />
                    <Text fontSize="sm">{formatDate(route.createdAt)}</Text>
                  </HStack>
                </HStack>
              </VStack>

              <Button
                leftIcon={<Icon as={FaTrash} />}
                colorScheme="red"
                variant="outline"
                onClick={onOpen}
              >
                Delete
              </Button>
            </Flex>
          </Box>

          {/* Route Stats */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <StatCard
              icon={FaRuler}
              label="Distance"
              value={`${route.distance.toFixed(2)} km`}
              gradient={gradientBg}
              bg={cardBg}
              borderColor={borderColor}
            />
            <StatCard
              icon={FaRoute}
              label="Waypoints"
              value={route.coordinates.length}
              gradient={gradientBg}
              bg={cardBg}
              borderColor={borderColor}
            />
            <StatCard
              icon={FaTachometerAlt}
              label="Difficulty"
              value={route.difficulty}
              gradient={gradientBg}
              bg={cardBg}
              borderColor={borderColor}
            />
          </SimpleGrid>

          {/* Map */}
          <Box
            bg={cardBg}
            p={6}
            borderRadius="2xl"
            border="1px"
            borderColor={borderColor}
            boxShadow="xl"
          >
            <VStack spacing={4} align="stretch">
              <Heading size="md">Route Map</Heading>
              <Divider />
              <Box
                ref={mapContainer}
                h="500px"
                borderRadius="xl"
                overflow="hidden"
                border="2px"
                borderColor={borderColor}
              />
              <HStack
                spacing={4}
                justify="center"
                fontSize="sm"
                color={textColor}
              >
                <HStack>
                  <Box w={3} h={3} bg="green.500" borderRadius="full" />
                  <Text>Start</Text>
                </HStack>
                <HStack>
                  <Box w={3} h={3} bg="red.500" borderRadius="full" />
                  <Text>End</Text>
                </HStack>
              </HStack>
            </VStack>
          </Box>

          {/* Additional Info */}
          <Box
            bg={accentBg}
            p={6}
            borderRadius="xl"
            border="1px"
            borderColor={borderColor}
          >
            <VStack spacing={3} align="start">
              <Heading size="sm" color="teal.600">
                Route Information
              </Heading>
              <Stack spacing={2} w="full">
                <HStack justify="space-between">
                  <Text fontWeight="medium">Created:</Text>
                  <Text color={textColor}>
                    {route.createdAt
                      ? new Date(route.createdAt).toLocaleString()
                      : "Unknown"}
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontWeight="medium">Route ID:</Text>
                  <Text color={textColor} fontSize="sm" fontFamily="mono">
                    {route._id}
                  </Text>
                </HStack>
              </Stack>
            </VStack>
          </Box>
        </VStack>
      </Container>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Route
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete "{route.name}"? This action cannot
              be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

const StatCard = ({
  icon,
  label,
  value,
  gradient,
  bg,
  borderColor,
}: {
  icon: any;
  label: string;
  value: string | number;
  gradient: string;
  bg: string;
  borderColor: string;
}) => {
  return (
    <Box
      bg={bg}
      p={6}
      borderRadius="xl"
      border="1px"
      borderColor={borderColor}
      boxShadow="md"
      _hover={{
        transform: "translateY(-4px)",
        boxShadow: "lg",
      }}
      transition="all 0.3s"
    >
      <VStack spacing={3}>
        <Flex
          w={12}
          h={12}
          bgGradient={gradient}
          color="white"
          borderRadius="full"
          align="center"
          justify="center"
        >
          <Icon as={icon} boxSize={6} />
        </Flex>
        <Text fontSize="sm" color="gray.500" fontWeight="medium">
          {label}
        </Text>
        <Text
          fontSize="2xl"
          fontWeight="bold"
          bgGradient={gradient}
          bgClip="text"
        >
          {value}
        </Text>
      </VStack>
    </Box>
  );
};

export default RouteDetails;
