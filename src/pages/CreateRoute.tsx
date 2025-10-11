import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Text,
  useToast,
  VStack,
  Icon,
  useColorModeValue,
  Flex,
  Badge,
  Select,
} from "@chakra-ui/react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { FaRoute, FaSave, FaRuler } from "react-icons/fa";

// Note: Replace with your Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const CreateRoute = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const draw = useRef<any>(null);
  const [distance, setDistance] = useState<number>(0);
  const [difficulty, setDifficulty] = useState<string>("Moderate");
  const toast = useToast();

  const headerBg = useColorModeValue("white", "gray.800");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const gradientBg = useColorModeValue(
    "linear(to-r, teal.500, blue.500)",
    "linear(to-r, teal.200, blue.200)"
  );

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-74.5, 40], // Default center (adjust as needed)
      zoom: 9,
    });

    draw.current = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        line_string: true,
        trash: true,
      },
      styles: [
        {
          id: "gl-draw-line",
          type: "line",
          filter: [
            "all",
            ["==", "$type", "LineString"],
            ["!=", "mode", "static"],
          ],
          layout: {
            "line-cap": "round",
            "line-join": "round",
          },
          paint: {
            "line-color": "#FF3333",
            "line-width": 4,
          },
        },
        {
          id: "gl-draw-line-static",
          type: "line",
          filter: [
            "all",
            ["==", "$type", "LineString"],
            ["==", "mode", "static"],
          ],
          layout: {
            "line-cap": "round",
            "line-join": "round",
          },
          paint: {
            "line-color": "#FF3333",
            "line-width": 4,
          },
        },
      ],
    });

    map.current.addControl(draw.current);

    map.current.on("draw.create", updateRoute);
    map.current.on("draw.update", updateRoute);
    map.current.on("draw.delete", updateRoute);

    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          map.current?.flyTo({
            center: [longitude, latitude],
            zoom: 13,
          });
        },
        () => {
          toast({
            title: "Location access denied",
            description: "Using default map location",
            status: "info",
            duration: 3000,
            isClosable: true,
          });
        }
      );
    }

    return () => {
      map.current?.remove();
    };
  }, []);

  const updateRoute = () => {
    const data = draw.current.getAll();
    if (data.features.length > 0) {
      const route = data.features[0];
      // Calculate distance (rough approximation)
      const coordinates = route.geometry.coordinates;
      let totalDistance = 0;
      for (let i = 1; i < coordinates.length; i++) {
        const from = coordinates[i - 1];
        const to = coordinates[i];
        totalDistance += calculateDistance(from[1], from[0], to[1], to[0]);
      }
      setDistance(totalDistance);
    } else {
      setDistance(0);
    }
  };

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleSaveRoute = () => {
    const data = draw.current.getAll();
    if (data.features.length > 0) {
      // Here you would typically save the route to your backend
      toast({
        title: "Route saved!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: "No route drawn",
        description: "Please draw a route before saving",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "green";
      case "moderate":
        return "orange";
      case "hard":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <Box
      bg={useColorModeValue("gray.50", "gray.900")}
      minH="calc(100vh - 60px)"
      display="flex"
      flexDirection="column"
    >
      {/* Header Section */}
      <Box
        bg={headerBg}
        boxShadow="sm"
        position="sticky"
        top="0"
        zIndex="sticky"
        py={4}
        mb={8}
        w="100%"
      >
        <Container maxW="container.xl" px={{ base: 4, md: 8 }}>
          <VStack spacing={4} align="stretch">
            <Flex justify="space-between" align="center">
              <VStack align="start" spacing={1}>
                <Heading size="xl" bgGradient={gradientBg} bgClip="text">
                  Create New Route
                </Heading>
                <Text color="gray.500">
                  Draw your route on the map and customize its details
                </Text>
              </VStack>
              <HStack spacing={4}>
                <Badge
                  colorScheme={getDifficultyColor(difficulty)}
                  p={2}
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  gap={2}
                >
                  <Icon as={FaRoute} />
                  {distance.toFixed(2)} km
                </Badge>
                <Select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  w="150px"
                  bg={cardBg}
                  borderColor={borderColor}
                >
                  <option value="Easy">Easy</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Hard">Hard</option>
                </Select>
              </HStack>
            </Flex>
          </VStack>
        </Container>
      </Box>

      <Container maxW="container.xl" flex="1" px={{ base: 4, md: 8 }} pb={8}>
        <Box
          bg={cardBg}
          borderRadius="2xl"
          overflow="hidden"
          border="1px"
          borderColor={borderColor}
          boxShadow="xl"
          mb={6}
        >
          <Box ref={mapContainer} h="600px" w="100%" />
        </Box>

        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <HStack spacing={6}>
            <HStack>
              <Icon as={FaRuler} color="teal.500" />
              <Text fontSize="lg">Distance: {distance.toFixed(2)} km</Text>
            </HStack>
            <HStack>
              <Icon as={FaRoute} color="teal.500" />
              <Text fontSize="lg">Difficulty: {difficulty}</Text>
            </HStack>
          </HStack>
          <Button
            leftIcon={<Icon as={FaSave} />}
            colorScheme="teal"
            onClick={handleSaveRoute}
            size="lg"
            _hover={{
              transform: "translateY(-2px)",
              shadow: "lg",
            }}
            transition="all 0.2s"
          >
            Save Route
          </Button>
        </Flex>
      </Container>
    </Box>
  );
};

export default CreateRoute;
