import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Text,
  useToast,
} from "@chakra-ui/react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";

// Note: Replace with your Mapbox access token
mapboxgl.accessToken = "YOUR_MAPBOX_ACCESS_TOKEN";

const CreateRoute = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const draw = useRef<any>(null);
  const [distance, setDistance] = useState<number>(0);
  const toast = useToast();

  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-74.5, 40], // Default center (adjust as needed)
      zoom: 9,
    });

    draw.current = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        line_string: true,
        trash: true,
      },
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
      });
    } else {
      toast({
        title: "No route drawn",
        description: "Please draw a route before saving",
        status: "warning",
        duration: 3000,
      });
    }
  };

  return (
    <Container maxW="container.xl" py={6}>
      <Heading mb={6}>Create New Route</Heading>
      <Box
        ref={mapContainer}
        h="600px"
        borderRadius="lg"
        overflow="hidden"
        mb={4}
      />
      <HStack justify="space-between" align="center">
        <Text fontSize="lg">Distance: {distance.toFixed(2)} km</Text>
        <Button colorScheme="teal" onClick={handleSaveRoute}>
          Save Route
        </Button>
      </HStack>
    </Container>
  );
};

export default CreateRoute;
