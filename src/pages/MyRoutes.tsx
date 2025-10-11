import {
  Container,
  Heading,
  SimpleGrid,
  Box,
  Text,
  Button,
  Image,
  VStack,
  HStack,
  Icon,
  useColorModeValue,
  Badge,
  Flex,
  Tooltip,
  Input,
  InputGroup,
  InputLeftElement,
  IconButton,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { useNavigate } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaRoute,
  FaCalendarAlt,
  FaChevronRight,
  FaSearch,
  FaTrash,
} from "react-icons/fa";
import { useState, useMemo, useEffect, useRef } from "react";
import { getRoutes, deleteRoute, type Route } from "../utils/routeStorage";

// Define animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const MyRoutes = () => {
  const navigate = useNavigate();
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headerBg = useColorModeValue("white", "gray.800");
  const gradientBg = useColorModeValue(
    "linear(to-r, teal.500, blue.500)",
    "linear(to-r, teal.200, blue.200)"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [routes, setRoutes] = useState<Route[]>([]);
  const [routeToDelete, setRouteToDelete] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Load routes from API on mount
  useEffect(() => {
    const loadRoutes = async () => {
      const loadedRoutes = await getRoutes();
      // Sort by date (newest first)
      loadedRoutes.sort((a: any, b: any) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
      setRoutes(loadedRoutes);
    };
    loadRoutes();
  }, []);

  // Mock data with coordinates for the route preview (keeping for backwards compatibility)
  const mockRoutes = [
    {
      id: 1,
      name: "Morning Run",
      distance: 5.2,
      location: "Central Park, New York",
      date: "2024-03-20",
      difficulty: "Moderate",
      coordinates: [
        [-73.968, 40.785],
        [-73.967, 40.783],
        [-73.963, 40.782],
      ],
    },
    {
      id: 2,
      name: "Park Loop",
      distance: 3.8,
      location: "Battery Park, New York",
      date: "2024-03-19",
      difficulty: "Easy",
      coordinates: [
        [-74.017, 40.703],
        [-74.015, 40.704],
        [-74.013, 40.702],
      ],
    },
    {
      id: 3,
      name: "City Trail",
      distance: 7.5,
      location: "Brooklyn Bridge Park",
      date: "2024-03-18",
      difficulty: "Hard",
      coordinates: [
        [-73.995, 40.702],
        [-73.993, 40.703],
        [-73.991, 40.704],
      ],
    },
    {
      id: 4,
      name: "Riverside Run",
      distance: 6.2,
      location: "Hudson River Park",
      date: "2024-03-17",
      difficulty: "Moderate",
      coordinates: [
        [-74.009, 40.733],
        [-74.008, 40.735],
        [-74.007, 40.737],
      ],
    },
    {
      id: 5,
      name: "Harbor Circuit",
      distance: 4.5,
      location: "South Street Seaport",
      date: "2024-03-16",
      difficulty: "Easy",
      coordinates: [
        [-74.003, 40.706],
        [-74.002, 40.704],
        [-74.0, 40.703],
      ],
    },
    {
      id: 6,
      name: "Sonoran Desert Loop",
      distance: 10.5,
      location: "Anthem, Arizona",
      date: "2024-03-15",
      difficulty: "Moderate",
      coordinates: [
        [-112.142, 33.868],
        [-112.138, 33.867],
        [-112.135, 33.869],
        [-112.137, 33.871],
      ],
    },
    {
      id: 7,
      name: "Queens Botanical Loop",
      distance: 3.2,
      location: "Flushing Meadows, NY",
      date: "2024-03-14",
      difficulty: "Easy",
      coordinates: [
        [-73.834, 40.741],
        [-73.832, 40.742],
        [-73.83, 40.74],
      ],
    },
    {
      id: 8,
      name: "High Line Express",
      distance: 8.4,
      location: "Chelsea, New York",
      date: "2024-03-13",
      difficulty: "Hard",
      coordinates: [
        [-74.005, 40.747],
        [-74.004, 40.749],
        [-74.002, 40.748],
      ],
    },
    {
      id: 9,
      name: "Roosevelt Island Circuit",
      distance: 5.7,
      location: "Roosevelt Island, NY",
      date: "2024-03-12",
      difficulty: "Moderate",
      coordinates: [
        [-73.944, 40.759],
        [-73.943, 40.761],
        [-73.942, 40.76],
      ],
    },
    {
      id: 10,
      name: "Prospect Park Sprint",
      distance: 4.8,
      location: "Brooklyn, NY",
      date: "2024-03-11",
      difficulty: "Easy",
      coordinates: [
        [-73.969, 40.661],
        [-73.967, 40.662],
        [-73.965, 40.66],
      ],
    },
  ];

  // Use real routes if available, otherwise use mock data
  const displayRoutes = routes.length > 0 ? routes : mockRoutes;

  // Filter routes based on search query
  const filteredRoutes = useMemo(() => {
    if (!searchQuery.trim()) return displayRoutes;

    const query = searchQuery.toLowerCase().trim();
    return displayRoutes.filter(
      (route) =>
        route.name.toLowerCase().includes(query) ||
        route.location.toLowerCase().includes(query)
    );
  }, [searchQuery, displayRoutes]);

  const handleDeleteClick = (routeId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setRouteToDelete(routeId);
    onOpen();
  };

  const confirmDelete = async () => {
    if (routeToDelete) {
      const success = await deleteRoute(routeToDelete);
      if (success) {
        setRoutes(routes.filter((r) => r.id !== routeToDelete));
      }
      setRouteToDelete(null);
    }
    onClose();
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

  const getMapPreviewUrl = (coordinates: number[][]) => {
    const lngs = coordinates.map((coord) => coord[0]);
    const lats = coordinates.map((coord) => coord[1]);
    const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;

    const geoJson = {
      type: "Feature",
      properties: {
        stroke: "#FF3333",
        "stroke-width": 3,
      },
      geometry: {
        type: "LineString",
        coordinates: coordinates,
      },
    };

    const encodedJson = encodeURIComponent(JSON.stringify(geoJson));
    return `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/geojson(${encodedJson})/${centerLng},${centerLat},13/300x200?access_token=${
      import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
    }`;
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
          <VStack spacing={6} align="stretch">
            <Flex justify="space-between" align="center">
              <VStack align="start" spacing={1}>
                <Heading size="xl" bgGradient={gradientBg} bgClip="text">
                  My Routes
                </Heading>
                <Text color="gray.500">
                  Track and manage your running adventures
                </Text>
              </VStack>
              <Tooltip label="Create a new running route" hasArrow>
                <Button
                  leftIcon={<Icon as={FaRoute} />}
                  rightIcon={<Icon as={FaChevronRight} />}
                  colorScheme="teal"
                  onClick={() => navigate("/create")}
                  size="lg"
                  _hover={{
                    transform: "translateY(-2px)",
                    shadow: "lg",
                  }}
                  transition="all 0.2s"
                >
                  Create New Route
                </Button>
              </Tooltip>
            </Flex>

            {/* Search Bar */}
            <InputGroup size="lg" maxW="600px">
              <InputLeftElement pointerEvents="none">
                <Icon as={FaSearch} color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search routes by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                bg={cardBg}
                border="1px"
                borderColor={borderColor}
                _hover={{
                  borderColor: "teal.300",
                }}
                _focus={{
                  borderColor: "teal.500",
                  boxShadow: "0 0 0 1px var(--chakra-colors-teal-500)",
                }}
                borderRadius="lg"
              />
            </InputGroup>
          </VStack>
        </Container>
      </Box>

      <Container maxW="container.xl" flex="1" px={{ base: 4, md: 8 }} pb={8}>
        {displayRoutes.length === 0 ? (
          <Box
            textAlign="center"
            py={10}
            px={6}
            bg={cardBg}
            borderRadius="xl"
            shadow="xl"
            animation={`${fadeIn} 0.5s ease-out`}
          >
            <Icon as={FaRoute} w={16} h={16} color="teal.500" mb={4} />
            <Heading size="lg" mb={4}>
              No Routes Yet
            </Heading>
            <Text fontSize="lg" mb={6} color="gray.500">
              Start creating your first running route!
            </Text>
            <Button
              colorScheme="teal"
              size="lg"
              leftIcon={<Icon as={FaRoute} />}
              rightIcon={<Icon as={FaChevronRight} />}
              onClick={() => navigate("/create")}
              _hover={{
                transform: "translateY(-2px)",
                shadow: "lg",
              }}
              transition="all 0.2s"
            >
              Create Your First Route
            </Button>
          </Box>
        ) : filteredRoutes.length === 0 ? (
          <Box
            textAlign="center"
            py={10}
            px={6}
            bg={cardBg}
            borderRadius="xl"
            shadow="xl"
            animation={`${fadeIn} 0.5s ease-out`}
          >
            <Icon as={FaSearch} w={12} h={12} color="teal.500" mb={4} />
            <Text fontSize="xl" mb={4}>
              No routes found matching "{searchQuery}"
            </Text>
            <Button
              colorScheme="teal"
              onClick={() => setSearchQuery("")}
              size="lg"
              _hover={{
                transform: "translateY(-2px)",
                shadow: "lg",
              }}
              transition="all 0.2s"
            >
              Clear Search
            </Button>
          </Box>
        ) : (
          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 3 }}
            spacing={{ base: 6, md: 8 }}
            animation={`${fadeIn} 0.5s ease-out`}
          >
            {filteredRoutes.map((route, index) => (
              <Box
                key={route.id}
                borderRadius="2xl"
                overflow="hidden"
                bg={cardBg}
                border="1px"
                borderColor={borderColor}
                position="relative"
                _hover={{
                  transform: "translateY(-8px) scale(1.02)",
                  shadow: "2xl",
                }}
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                cursor="pointer"
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                {/* Delete button */}
                <IconButton
                  aria-label="Delete route"
                  icon={<Icon as={FaTrash} />}
                  position="absolute"
                  top={4}
                  left={4}
                  colorScheme="red"
                  size="sm"
                  zIndex={2}
                  onClick={(e) => handleDeleteClick(String(route.id), e)}
                  _hover={{
                    transform: "scale(1.1)",
                  }}
                  transition="all 0.2s"
                />
                <Box position="relative">
                  <Image
                    src={getMapPreviewUrl(route.coordinates)}
                    alt={`Preview of ${route.name}`}
                    width="100%"
                    height="200px"
                    objectFit="cover"
                    fallbackSrc="https://via.placeholder.com/300x200?text=Map+Preview"
                  />
                  <Badge
                    position="absolute"
                    top={4}
                    right={4}
                    colorScheme={getDifficultyColor(route.difficulty)}
                    borderRadius="full"
                    px={3}
                    py={1}
                    textTransform="capitalize"
                    boxShadow="md"
                  >
                    {route.difficulty}
                  </Badge>
                </Box>

                <VStack spacing={4} p={6}>
                  <VStack align="start" spacing={2} w="full">
                    <Heading size="md" noOfLines={1}>
                      {route.name}
                    </Heading>
                    <HStack color="gray.500" fontSize="sm" spacing={4}>
                      <HStack>
                        <Icon as={FaMapMarkerAlt} />
                        <Text noOfLines={1}>{route.location}</Text>
                      </HStack>
                      <HStack>
                        <Icon as={FaCalendarAlt} />
                        <Text>{new Date(route.date).toLocaleDateString()}</Text>
                      </HStack>
                    </HStack>
                  </VStack>

                  <Box
                    w="full"
                    p={4}
                    bg={useColorModeValue("gray.50", "gray.700")}
                    borderRadius="lg"
                  >
                    <HStack justify="space-between">
                      <Text color="gray.500">Distance</Text>
                      <Text
                        fontWeight="bold"
                        fontSize="lg"
                        bgGradient={gradientBg}
                        bgClip="text"
                      >
                        {route.distance} km
                      </Text>
                    </HStack>
                  </Box>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        )}
      </Container>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isCentered
      >
        <AlertDialogOverlay backdropFilter="blur(4px)">
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Route
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this route? This action cannot be
              undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default MyRoutes;
