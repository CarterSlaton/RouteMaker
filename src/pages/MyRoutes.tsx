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
  FaRunning,
  FaPlus,
} from "react-icons/fa";
import { useState, useMemo, useEffect, useRef } from "react";
import { getRoutes, deleteRoute, type Route } from "../utils/routeStorage";
import RouteCardSkeleton from "../components/RouteCardSkeleton";
import { useDistanceUnit } from "../utils/useDistanceUnit";
import { useAuth } from "../contexts/AuthContext";

// Define animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const MyRoutes = () => {
  const { formatDistance } = useDistanceUnit();
  const navigate = useNavigate();
  const { user } = useAuth();
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headerBg = useColorModeValue("white", "gray.800");
  const gradientBg = useColorModeValue(
    "linear(to-r, teal.500, blue.500)",
    "linear(to-r, teal.200, blue.200)"
  );
  const pageBg = useColorModeValue("gray.50", "gray.900");
  const statBoxBg = useColorModeValue("gray.50", "gray.700");
  const headingColor = useColorModeValue("gray.800", "white");
  const textColor = useColorModeValue("gray.500", "gray.400");

  // Get user preferences
  const isCompactView = user?.compactView ?? false;
  const showPreview = user?.showRoutePreview ?? true;
  const reduceAnimations = user?.reduceAnimations ?? false;

  const [searchQuery, setSearchQuery] = useState("");
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [routeToDelete, setRouteToDelete] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Load routes from API on mount
  useEffect(() => {
    const loadRoutes = async () => {
      setLoading(true);
      const loadedRoutes = await getRoutes();
      // Sort by date (newest first)
      loadedRoutes.sort((a: any, b: any) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
      setRoutes(loadedRoutes);
      setLoading(false);
    };
    loadRoutes();
  }, []);

  // Use only real routes from the database
  const displayRoutes = routes;

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
    // Add green marker for start position
    const startMarker = `pin-s+38A169(${coordinates[0][0]},${coordinates[0][1]})`;

    const geoJson = {
      type: "Feature",
      properties: {
        stroke: "#3182CE",
        "stroke-width": 3,
        "stroke-opacity": 0.8,
      },
      geometry: {
        type: "LineString",
        coordinates: coordinates,
      },
    };

    const encodedJson = encodeURIComponent(JSON.stringify(geoJson));
    // Use 'auto' to automatically fit the route bounds with padding
    return `https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/${startMarker},geojson(${encodedJson})/auto/300x200?access_token=${
      import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
    }&padding=40`;
  };

  return (
    <Box
      bg={pageBg}
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
            <Flex
              justify="space-between"
              align="center"
              direction={{ base: "column", md: "row" }}
              gap={4}
            >
              <VStack
                align={{ base: "center", md: "start" }}
                spacing={1}
                w={{ base: "100%", md: "auto" }}
              >
                <Heading
                  size={{ base: "lg", md: "xl" }}
                  bgGradient={gradientBg}
                  bgClip="text"
                >
                  My Routes
                </Heading>
                <Text
                  color="gray.500"
                  fontSize={{ base: "sm", md: "md" }}
                  textAlign={{ base: "center", md: "left" }}
                >
                  Track and manage your running adventures
                </Text>
              </VStack>
              <Tooltip label="Create a new running route" hasArrow>
                <Button
                  leftIcon={<Icon as={FaRoute} />}
                  rightIcon={
                    <Icon
                      as={FaChevronRight}
                      display={{ base: "none", sm: "inline" }}
                    />
                  }
                  colorScheme="teal"
                  onClick={() => navigate("/create")}
                  size={{ base: "md", md: "lg" }}
                  w={{ base: "100%", md: "auto" }}
                  bgGradient="linear(to-r, teal.500, blue.500)"
                  _hover={{
                    transform: "translateY(-2px)",
                    shadow: "lg",
                    bgGradient: "linear(to-r, teal.600, blue.600)",
                  }}
                  _active={{
                    bgGradient: "linear(to-r, teal.600, blue.600)",
                  }}
                  transition="all 0.2s"
                >
                  Generate Route
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
                color={headingColor}
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
        ) : loading ? (
          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 3 }}
            spacing={{ base: 6, md: 8 }}
          >
            {[...Array(6)].map((_, index) => (
              <RouteCardSkeleton key={index} />
            ))}
          </SimpleGrid>
        ) : filteredRoutes.length === 0 ? (
          <Box
            textAlign="center"
            py={20}
            px={6}
            animation={`${fadeIn} 0.5s ease-out`}
          >
            <Icon
              as={FaRunning}
              boxSize={20}
              color="teal.500"
              mb={6}
              opacity={0.6}
            />
            <Heading size="lg" mb={4} color={headingColor}>
              {routes.length === 0 ? "No routes yet" : "No routes found"}
            </Heading>
            <Text fontSize="lg" color={textColor} mb={8}>
              {routes.length === 0
                ? "Start your running journey by creating your first route!"
                : "Try adjusting your search to find what you're looking for."}
            </Text>
            {routes.length === 0 && (
              <Button
                leftIcon={<Icon as={FaPlus} />}
                colorScheme="teal"
                size="lg"
                onClick={() => navigate("/create-route")}
                _hover={{
                  transform: "translateY(-2px)",
                  shadow: "lg",
                }}
                transition="all 0.2s"
              >
                Create Your First Route
              </Button>
            )}
          </Box>
        ) : isCompactView ? (
          // Compact list view
          <VStack
            spacing={4}
            animation={reduceAnimations ? "none" : `${fadeIn} 0.5s ease-out`}
          >
            {filteredRoutes.map((route, index) => (
              <Flex
                key={route.id}
                bg={cardBg}
                border="1px"
                borderColor={borderColor}
                borderRadius="lg"
                p={4}
                w="full"
                align="center"
                gap={4}
                cursor="pointer"
                _hover={{
                  shadow: "lg",
                  transform: reduceAnimations ? "none" : "translateX(4px)",
                }}
                transition={reduceAnimations ? "none" : "all 0.2s"}
                onClick={() =>
                  navigate(`/route/${"_id" in route ? route._id : route.id}`)
                }
                style={{
                  animationDelay: reduceAnimations ? "0s" : `${index * 0.05}s`,
                }}
              >
                {/* Compact preview (only if showPreview is true) */}
                {showPreview && (
                  <Image
                    src={getMapPreviewUrl(route.coordinates)}
                    alt={`Preview of ${route.name}`}
                    width="120px"
                    height="80px"
                    objectFit="cover"
                    borderRadius="md"
                    flexShrink={0}
                    fallbackSrc="https://via.placeholder.com/120x80?text=Map"
                  />
                )}

                {/* Route info */}
                <Flex flex="1" align="center" justify="space-between" gap={4}>
                  <VStack align="start" spacing={1} flex="1">
                    <Heading size="sm" noOfLines={1} color={headingColor}>
                      {route.name}
                    </Heading>
                    <HStack
                      color={textColor}
                      fontSize="xs"
                      spacing={3}
                      flexWrap="wrap"
                    >
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

                  {/* Stats */}
                  <HStack spacing={4} flexShrink={0}>
                    <Badge
                      colorScheme={getDifficultyColor(route.difficulty)}
                      borderRadius="full"
                      px={3}
                      py={1}
                      textTransform="capitalize"
                    >
                      {route.difficulty}
                    </Badge>
                    <Text
                      fontWeight="bold"
                      fontSize="lg"
                      bgGradient={gradientBg}
                      bgClip="text"
                      minW="80px"
                      textAlign="right"
                    >
                      {formatDistance(route.distance)}
                    </Text>
                    <IconButton
                      aria-label="Delete route"
                      icon={<Icon as={FaTrash} />}
                      colorScheme="red"
                      size="sm"
                      onClick={(e) => handleDeleteClick(String(route.id), e)}
                      _hover={{
                        transform: "scale(1.1)",
                      }}
                      transition="all 0.2s"
                    />
                  </HStack>
                </Flex>
              </Flex>
            ))}
          </VStack>
        ) : (
          // Grid card view
          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 3 }}
            spacing={{ base: 6, md: 8 }}
            animation={reduceAnimations ? "none" : `${fadeIn} 0.5s ease-out`}
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
                  transform: reduceAnimations
                    ? "none"
                    : "translateY(-8px) scale(1.02)",
                  shadow: "2xl",
                }}
                transition={
                  reduceAnimations
                    ? "none"
                    : "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                }
                cursor="pointer"
                onClick={() =>
                  navigate(`/route/${"_id" in route ? route._id : route.id}`)
                }
                style={{
                  animationDelay: reduceAnimations ? "0s" : `${index * 0.1}s`,
                }}
              >
                {/* Conditionally show map preview based on showPreview preference */}
                {showPreview && (
                  <Box position="relative">
                    {/* Delete button on map */}
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
                    <Image
                      src={getMapPreviewUrl(route.coordinates)}
                      alt={`Preview of ${route.name}`}
                      width="100%"
                      height="200px"
                      objectFit="cover"
                      loading="lazy"
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
                )}

                <VStack spacing={4} p={6} position="relative">
                  <VStack align="start" spacing={2} w="full">
                    <HStack justify="space-between" w="full" align="start">
                      <Heading
                        size="md"
                        noOfLines={1}
                        color={headingColor}
                        flex="1"
                        pr={2}
                      >
                        {route.name}
                      </Heading>
                      <HStack spacing={2} flexShrink={0}>
                        {!showPreview && (
                          <>
                            <Badge
                              colorScheme={getDifficultyColor(route.difficulty)}
                              borderRadius="full"
                              px={3}
                              py={1}
                              textTransform="capitalize"
                            >
                              {route.difficulty}
                            </Badge>
                            <IconButton
                              aria-label="Delete route"
                              icon={<Icon as={FaTrash} />}
                              colorScheme="red"
                              size="sm"
                              onClick={(e) =>
                                handleDeleteClick(String(route.id), e)
                              }
                              _hover={{
                                transform: "scale(1.1)",
                              }}
                              transition="all 0.2s"
                            />
                          </>
                        )}
                      </HStack>
                    </HStack>
                    <HStack color={textColor} fontSize="sm" spacing={4}>
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

                  <Box w="full" p={4} bg={statBoxBg} borderRadius="lg">
                    <HStack justify="space-between">
                      <Text color={textColor}>Distance</Text>
                      <Text
                        fontWeight="bold"
                        fontSize="lg"
                        bgGradient={gradientBg}
                        bgClip="text"
                      >
                        {formatDistance(route.distance)}
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
