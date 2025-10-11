import { useEffect, useRef, memo } from "react";
import { Box } from "@chakra-ui/react";
import mapboxgl from "mapbox-gl";
import type { Route } from "../utils/routeStorage";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

interface RouteMapProps {
  route: Route;
  height?: string;
}

const RouteMap = memo(({ route, height = "500px" }: RouteMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!route || !mapContainer.current || map.current) return;

    if (!mapboxgl.accessToken) {
      console.error("Mapbox access token is missing");
      return;
    }

    try {
      // Coordinates are already in [lng, lat] format
      const coordinates = route.coordinates as [number, number][];

      // Calculate bounds
      const bounds = coordinates.reduce(
        (bounds, coord) => bounds.extend(coord),
        new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
      );

      // Initialize map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        bounds: bounds,
        fitBoundsOptions: { padding: 50 },
      });

      map.current.on("load", () => {
        if (!map.current) return;

        // Add route line
        map.current.addSource("route", {
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

        map.current.addLayer({
          id: "route",
          type: "line",
          source: "route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#3182CE",
            "line-width": 4,
            "line-opacity": 0.8,
          },
        });

        // Add start marker
        new mapboxgl.Marker({ color: "#38A169" })
          .setLngLat(coordinates[0])
          .addTo(map.current);

        // Add end marker
        new mapboxgl.Marker({ color: "#E53E3E" })
          .setLngLat(coordinates[coordinates.length - 1])
          .addTo(map.current);
      });
    } catch (error) {
      console.error("Error initializing map:", error);
    }

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [route]);

  return (
    <Box
      ref={mapContainer}
      w="100%"
      h={height}
      borderRadius="lg"
      overflow="hidden"
      boxShadow="md"
    />
  );
});

RouteMap.displayName = "RouteMap";

export default RouteMap;
