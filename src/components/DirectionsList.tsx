import {
  Box,
  VStack,
  HStack,
  Text,
  Icon,
  useColorModeValue,
  Divider,
} from "@chakra-ui/react";
import {
  FaArrowUp,
  FaArrowLeft,
  FaArrowRight,
  FaMapMarkerAlt,
  FaPlay,
} from "react-icons/fa";
import { useDistanceUnit } from "../utils/useDistanceUnit";

interface DirectionsListProps {
  directions: Array<{
    instruction: string;
    distance: number;
    type: string;
  }>;
}

const getDirectionIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "turn":
    case "turn left":
    case "left":
      return FaArrowLeft;
    case "turn right":
    case "right":
      return FaArrowRight;
    case "arrive":
    case "destination":
      return FaMapMarkerAlt;
    case "depart":
    case "start":
      return FaPlay;
    case "continue":
    case "straight":
      return FaArrowUp;
    default:
      return FaArrowUp;
  }
};

const DirectionsList = ({ directions }: DirectionsListProps) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const iconBg = useColorModeValue("teal.50", "teal.900");
  const iconColor = useColorModeValue("teal.600", "teal.300");
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  const { preferredUnit } = useDistanceUnit();

  const formatDistance = (meters: number): string => {
    const km = meters / 1000;
    if (preferredUnit === "mi") {
      const miles = km * 0.621371;
      if (miles < 0.1) {
        const feet = meters * 3.28084;
        return `${Math.round(feet)}ft`;
      }
      return `${miles.toFixed(1)}mi`;
    }
    if (meters < 1000) {
      return `${meters}m`;
    }
    return `${km.toFixed(1)}km`;
  };

  return (
    <Box
      bg={cardBg}
      borderRadius="xl"
      border="1px"
      borderColor={borderColor}
      overflow="hidden"
      boxShadow="sm"
    >
      <VStack spacing={0} align="stretch" divider={<Divider />}>
        {directions.map((direction, index) => (
          <HStack
            key={index}
            p={4}
            spacing={4}
            align="flex-start"
            _hover={{ bg: hoverBg }}
            transition="all 0.2s"
          >
            <Box
              bg={iconBg}
              p={3}
              borderRadius="full"
              minW="48px"
              h="48px"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon
                as={getDirectionIcon(direction.type)}
                color={iconColor}
                boxSize={5}
              />
            </Box>
            <VStack align="flex-start" spacing={1} flex={1}>
              <Text fontWeight="semibold" fontSize="md">
                {direction.instruction}
              </Text>
              <Text fontSize="sm" color={textColor}>
                {formatDistance(direction.distance)}
              </Text>
            </VStack>
            <Text
              fontSize="lg"
              fontWeight="bold"
              color={textColor}
              minW="40px"
              textAlign="right"
            >
              {index + 1}
            </Text>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
};

export default DirectionsList;
