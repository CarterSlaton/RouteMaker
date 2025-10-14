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
  Input,
  FormControl,
  FormLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { FaRoute, FaSave, FaRuler } from "react-icons/fa";
import { saveRoute } from "../utils/routeStorage";
import { useNavigate } from "react-router-dom";
import { useDistanceUnit } from "../utils/useDistanceUnit";
import { milesToKm } from "../utils/unitConversion";
import { useAuth } from "../contexts/AuthContext";

// Initialize Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

const CreateRoute = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const draw = useRef<any>(null);
  const [distance, setDistance] = useState<number>(0);
  const [difficulty, setDifficulty] = useState<string>("Moderate");
  const [routeName, setRouteName] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [targetDistance, setTargetDistance] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isGenerateOpen,
    onOpen: onGenerateOpen,
    onClose: onGenerateClose,
  } = useDisclosure();
  const toast = useToast();
  const navigate = useNavigate();
  const { preferredUnit, formatDistance } = useDistanceUnit();
  const { user } = useAuth();
  const reduceAnimations = user?.reduceAnimations ?? false;

  const headerBg = useColorModeValue("white", "gray.800");
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const gradientBg = useColorModeValue(
    "linear(to-r, teal.500, blue.500)",
    "linear(to-r, teal.200, blue.200)"
  );

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

  const calculateDifficulty = (
    distanceKm: number
  ): "Easy" | "Moderate" | "Hard" => {
    if (distanceKm < 3) {
      return "Easy";
    } else if (distanceKm < 8) {
      return "Moderate";
    } else {
      return "Hard";
    }
  };

  const updateRoute = () => {
    const data = draw.current?.getAll();
    if (data && data.features.length > 0) {
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
      // Automatically set difficulty based on distance
      setDifficulty(calculateDifficulty(totalDistance));
    } else {
      setDistance(0);
      setDifficulty("Moderate");
    }
  };

  useEffect(() => {
    if (!mapContainer.current) return;

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
      // Use user's preferred map style or default to dark-v11
      const mapStyle = user?.mapStyle || "dark-v11";
      const defaultZoom = user?.defaultZoom || 9;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: `mapbox://styles/mapbox/${mapStyle}`,
        center: [-74.5, 40], // Default center (adjust as needed)
        zoom: defaultZoom,
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
            setUserLocation([longitude, latitude]);
            map.current?.flyTo({
              center: [longitude, latitude],
              zoom: 13,
            });

            // Reverse geocode to get location name
            fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxgl.accessToken}`
            )
              .then((res) => res.json())
              .then((data) => {
                if (data.features && data.features.length > 0) {
                  const place = data.features[0];
                  setLocation(place.place_name || "Unknown Location");
                }
              })
              .catch(() => {
                setLocation("Unknown Location");
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
            setLocation("Unknown Location");
          }
        );
      }
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

    return () => {
      map.current?.remove();
    };
  }, [toast]);

  // Auto-save draft functionality
  useEffect(() => {
    if (!user?.autoSaveRoutes || distance === 0) return;

    const autoSaveInterval = setInterval(() => {
      const data = draw.current?.getAll();
      if (data && data.features.length > 0) {
        // Save draft to localStorage
        const draft = {
          distance,
          difficulty,
          location,
          coordinates: data.features[0].geometry.coordinates,
          lastSaved: new Date().toISOString(),
        };
        localStorage.setItem("routeDraft", JSON.stringify(draft));

        toast({
          title: "Draft auto-saved",
          status: "info",
          duration: 2000,
          isClosable: true,
          position: "bottom-right",
        });
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [user?.autoSaveRoutes, distance, difficulty, location, toast]);

  // Load draft on mount if auto-save is enabled
  useEffect(() => {
    if (!user?.autoSaveRoutes) return;

    const savedDraft = localStorage.getItem("routeDraft");
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        const lastSaved = new Date(draft.lastSaved);
        const hoursSinceLastSave =
          (Date.now() - lastSaved.getTime()) / (1000 * 60 * 60);

        // Only restore if saved within last 24 hours
        if (hoursSinceLastSave < 24 && draft.coordinates) {
          toast({
            title: "Draft found",
            description: "Would you like to restore your last route draft?",
            status: "info",
            duration: 10000,
            isClosable: true,
            position: "top",
          });

          // You could add a restore button here in a future enhancement
          // For now, just notify the user
        }
      } catch (error) {
        console.error("Error loading draft:", error);
      }
    }
  }, [user?.autoSaveRoutes, toast]);

  const handleSaveRoute = () => {
    const data = draw.current.getAll();
    if (data.features.length === 0) {
      toast({
        title: "No route drawn",
        description: "Please draw a route before saving",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (distance === 0) {
      toast({
        title: "Invalid route",
        description: "Route distance must be greater than 0",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Open modal to get route name
    onOpen();
  };

  const confirmSaveRoute = async () => {
    if (!routeName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your route",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const data = draw.current.getAll();
    const route = data.features[0];
    const coordinates = route.geometry.coordinates;

    try {
      await saveRoute({
        name: routeName.trim(),
        distance: parseFloat(distance.toFixed(2)),
        location: location || "Unknown Location",
        date: new Date().toISOString().split("T")[0],
        difficulty: difficulty as "Easy" | "Moderate" | "Hard",
        coordinates: coordinates,
      });

      toast({
        title: "Route saved!",
        description: `"${routeName}" has been saved successfully`,
        status: "success",
        duration: 4000,
        isClosable: true,
      });

      // Reset form
      setRouteName("");
      draw.current.deleteAll();
      setDistance(0);
      onClose();

      // Clear auto-save draft
      localStorage.removeItem("routeDraft");

      // Navigate to My Routes after a short delay
      setTimeout(() => {
        navigate("/my-routes");
      }, 1500);
    } catch (error) {
      toast({
        title: "Error saving route",
        description: "Could not save your route. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const generateAutoRoute = async () => {
    const inputDistance = parseFloat(targetDistance);

    if (!inputDistance || inputDistance <= 0) {
      toast({
        title: "Invalid distance",
        description: "Please enter a valid distance greater than 0",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!userLocation) {
      toast({
        title: "Location required",
        description: "Please allow location access to generate a route",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsGenerating(true);
    onGenerateClose();

    // Convert to km if user is using miles
    const target =
      preferredUnit === "mi" ? milesToKm(inputDistance) : inputDistance;

    const MAX_ATTEMPTS = 3;
    const TARGET_ERROR = 0.07; // 7% error tolerance
    let bestRoute: any = null;
    let bestError = Infinity;

    try {
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        // Calculate waypoint parameters with slight variation per attempt
        const radiusKm = target / (5.5 + attempt * 0.3); // Vary radius slightly
        const radiusDegrees = radiusKm / 111; // 1 degree ≈ 111 km

        // Optimize number of waypoints based on distance
        let numWaypoints: number;
        if (target < 3) {
          numWaypoints = 3;
        } else if (target < 8) {
          numWaypoints = 4;
        } else {
          numWaypoints = 5;
        }

        const waypoints: [number, number][] = [];

        // Generate waypoints with better distribution
        for (let i = 0; i < numWaypoints; i++) {
          // Use different angle offsets per attempt
          const angleOffset = (attempt - 1) * (Math.PI / 6);
          const angle = (i / numWaypoints) * 2 * Math.PI + angleOffset;

          // Vary radius more strategically - tighter circle for better control
          const radiusVariation = 0.7 + Math.random() * 0.4;
          const r = radiusDegrees * radiusVariation;

          const lng = userLocation[0] + r * Math.cos(angle);
          const lat = userLocation[1] + r * Math.sin(angle);
          waypoints.push([lng, lat]);
        }

        // Add start point at beginning and end for loop
        const allPoints = [userLocation, ...waypoints, userLocation];
        const coordinates = allPoints.map((p) => p.join(",")).join(";");

        // Call Mapbox Directions API
        const response = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/walking/${coordinates}?geometries=geojson&access_token=${mapboxgl.accessToken}`
        );

        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const routeDistance = route.distance / 1000; // Convert to km
          const distanceError = Math.abs(routeDistance - target) / target;

          // Track best route
          if (distanceError < bestError) {
            bestError = distanceError;
            bestRoute = {
              distance: routeDistance,
              coordinates: route.geometry.coordinates,
            };
          }

          // If within 7% target, use this route immediately
          if (distanceError <= TARGET_ERROR) {
            toast({
              title: "Perfect route generated!",
              description: `Created a ${formatDistance(routeDistance)} loop (${(
                distanceError * 100
              ).toFixed(1)}% accuracy)${
                attempt > 1 ? ` on attempt ${attempt}` : ""
              }`,
              status: "success",
              duration: 4000,
              isClosable: true,
            });
            break; // Success! Stop trying
          }

          // If this is the last attempt, use the best route we found
          if (attempt === MAX_ATTEMPTS) {
            if (bestError <= 0.12) {
              // Within 12% is acceptable
              toast({
                title: "Route generated",
                description: `Best route: ${formatDistance(
                  bestRoute.distance
                )} (target: ${formatDistance(target)}, ${(
                  bestError * 100
                ).toFixed(1)}% off)`,
                status: "info",
                duration: 5000,
                isClosable: true,
              });
            } else {
              toast({
                title: "Route generated with higher variance",
                description: `Generated ${formatDistance(
                  bestRoute.distance
                )} route. You can adjust manually if needed.`,
                status: "warning",
                duration: 5000,
                isClosable: true,
              });
            }
          }
        } else {
          // If no route found and it's the last attempt, throw error
          if (attempt === MAX_ATTEMPTS) {
            throw new Error("No route found");
          }
          // Otherwise, continue to next attempt
        }
      }

      // Display the best route we found
      if (bestRoute) {
        // Clear existing drawings
        draw.current?.deleteAll();

        // Add the generated route
        const routeGeoJSON = {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: bestRoute.coordinates,
          },
        };

        draw.current?.add(routeGeoJSON);
        setDistance(bestRoute.distance);
        // Automatically set difficulty based on distance
        setDifficulty(calculateDifficulty(bestRoute.distance));

        // Fit map to route
        const bounds = bestRoute.coordinates.reduce(
          (bounds: mapboxgl.LngLatBounds, coord: number[]) => {
            return bounds.extend(coord as [number, number]);
          },
          new mapboxgl.LngLatBounds(
            bestRoute.coordinates[0],
            bestRoute.coordinates[0]
          )
        );
        map.current?.fitBounds(bounds, { padding: 50 });
      } else {
        throw new Error("No route could be generated");
      }
    } catch (error) {
      console.error("Error generating route:", error);
      toast({
        title: "Generation failed",
        description:
          "Could not generate route. Try a different distance or location.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsGenerating(false);
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
                <Text color={useColorModeValue("gray.500", "gray.400")}>
                  Draw your route on the map or auto-generate a loop
                </Text>
              </VStack>
              <HStack spacing={4}>
                <Button
                  leftIcon={<Icon as={FaRoute} />}
                  colorScheme="purple"
                  variant="outline"
                  onClick={onGenerateOpen}
                  isLoading={isGenerating}
                  loadingText="Generating..."
                  size="md"
                  _hover={{
                    transform: reduceAnimations ? "none" : "translateY(-2px)",
                    shadow: "md",
                  }}
                  transition={reduceAnimations ? "none" : "all 0.2s"}
                >
                  Auto-Generate
                </Button>
                <Badge
                  colorScheme="blue"
                  p={2}
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  gap={2}
                  fontSize="md"
                >
                  <Icon as={FaRoute} />
                  {formatDistance(distance)}
                </Badge>
                <Badge
                  colorScheme={getDifficultyColor(difficulty)}
                  p={2}
                  borderRadius="full"
                  fontSize="md"
                  textTransform="capitalize"
                >
                  {difficulty}
                </Badge>
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
              <Text
                fontSize="lg"
                color={useColorModeValue("gray.800", "white")}
              >
                Distance: {formatDistance(distance)}
              </Text>
            </HStack>
            <HStack>
              <Icon as={FaRoute} color="teal.500" />
              <Text
                fontSize="lg"
                color={useColorModeValue("gray.800", "white")}
              >
                Difficulty: {difficulty}{" "}
                <Text
                  as="span"
                  fontSize="sm"
                  color={useColorModeValue("gray.500", "gray.400")}
                >
                  (auto)
                </Text>
              </Text>
            </HStack>
          </HStack>
          <Button
            leftIcon={<Icon as={FaSave} />}
            colorScheme="teal"
            onClick={handleSaveRoute}
            size="lg"
            _hover={{
              transform: reduceAnimations ? "none" : "translateY(-2px)",
              shadow: "lg",
            }}
            transition={reduceAnimations ? "none" : "all 0.2s"}
          >
            Save Route
          </Button>
        </Flex>
      </Container>

      {/* Save Route Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent>
          <ModalHeader
            bgGradient={gradientBg}
            bgClip="text"
            color={useColorModeValue("gray.800", "white")}
          >
            Save Your Route
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel color={useColorModeValue("gray.700", "gray.200")}>
                  Route Name
                </FormLabel>
                <Input
                  placeholder="e.g., Morning Park Run"
                  value={routeName}
                  onChange={(e) => setRouteName(e.target.value)}
                  autoFocus
                  color={useColorModeValue("gray.800", "white")}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      confirmSaveRoute();
                    }
                  }}
                />
              </FormControl>

              <FormControl>
                <FormLabel color={useColorModeValue("gray.700", "gray.200")}>
                  Location
                </FormLabel>
                <Input
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  color={useColorModeValue("gray.800", "white")}
                />
              </FormControl>

              <Box
                w="full"
                p={4}
                bg={useColorModeValue("gray.50", "gray.700")}
                borderRadius="lg"
              >
                <VStack spacing={2} align="stretch">
                  <HStack justify="space-between">
                    <Text color={useColorModeValue("gray.500", "gray.400")}>
                      Distance:
                    </Text>
                    <Text
                      fontWeight="bold"
                      color={useColorModeValue("gray.800", "white")}
                    >
                      {formatDistance(distance)}
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color={useColorModeValue("gray.500", "gray.400")}>
                      Difficulty:
                    </Text>
                    <Badge colorScheme={getDifficultyColor(difficulty)}>
                      {difficulty}
                    </Badge>
                  </HStack>
                </VStack>
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="teal"
              onClick={confirmSaveRoute}
              leftIcon={<Icon as={FaSave} />}
            >
              Save Route
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Auto-Generate Route Modal */}
      <Modal isOpen={isGenerateOpen} onClose={onGenerateClose} isCentered>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent>
          <ModalHeader
            bgGradient={gradientBg}
            bgClip="text"
            color={useColorModeValue("gray.800", "white")}
          >
            Auto-Generate Loop Route
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel color={useColorModeValue("gray.700", "gray.200")}>
                  Target Distance ({preferredUnit})
                </FormLabel>
                <Input
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="50"
                  placeholder={`e.g., ${
                    preferredUnit === "km" ? "5.0" : "3.1"
                  }`}
                  value={targetDistance}
                  onChange={(e) => setTargetDistance(e.target.value)}
                  autoFocus
                  color={useColorModeValue("gray.800", "white")}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      generateAutoRoute();
                    }
                  }}
                />
              </FormControl>

              <Box
                w="full"
                p={4}
                bg={useColorModeValue("gray.50", "gray.700")}
                borderRadius="lg"
              >
                <VStack spacing={2} align="start">
                  <Text
                    fontSize="sm"
                    color={useColorModeValue("gray.500", "gray.400")}
                  >
                    ℹ️ This will generate a loop route that starts and ends at
                    your current location.
                  </Text>
                  <Text
                    fontSize="sm"
                    color={useColorModeValue("gray.500", "gray.400")}
                  >
                    • Target accuracy: Within 7%
                  </Text>
                  <Text
                    fontSize="sm"
                    color={useColorModeValue("gray.500", "gray.400")}
                  >
                    • Smart retry: Up to 3 attempts
                  </Text>
                  <Text
                    fontSize="sm"
                    color={useColorModeValue("gray.500", "gray.400")}
                  >
                    • Uses walking paths and roads
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    • You can edit the route after generation
                  </Text>
                </VStack>
              </Box>

              {!userLocation && (
                <Box
                  w="full"
                  p={3}
                  bg="orange.50"
                  borderRadius="lg"
                  border="1px"
                  borderColor="orange.200"
                >
                  <Text fontSize="sm" color="orange.800">
                    ⚠️ Please allow location access to generate a route
                  </Text>
                </Box>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onGenerateClose}>
              Cancel
            </Button>
            <Button
              colorScheme="purple"
              onClick={generateAutoRoute}
              leftIcon={<Icon as={FaRoute} />}
              isLoading={isGenerating}
              isDisabled={!userLocation}
            >
              Generate Route
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CreateRoute;
