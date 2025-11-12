import {
  Container,
  Heading,
  SimpleGrid,
  Box,
  Text,
  Button,
  VStack,
  HStack,
  Icon,
  useColorModeValue,
  Badge,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Spinner,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { useNavigate } from "react-router-dom";
import {
  FaRunning,
  FaCalendarAlt,
  FaSearch,
  FaClock,
  FaTachometerAlt,
  FaRoute,
  FaFilter,
} from "react-icons/fa";
import { useState, useMemo, useEffect } from "react";
import { useDistanceUnit } from "../utils/useDistanceUnit";
import { useAuth } from "../contexts/AuthContext";
import { formatTime, formatPace } from "../utils/gpsTracking";

// Define animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

interface Run {
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
  gpsPoints?: Array<{
    latitude: number;
    longitude: number;
    timestamp: string;
    accuracy: number;
  }>;
  pausedDuration: number;
  createdAt: string;
}

const RunHistory = () => {
  const { formatDistance, preferredUnit } = useDistanceUnit();
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
  const textColor = useColorModeValue("gray.600", "gray.300");
  const headingColor = useColorModeValue("gray.800", "white");
  const subTextColor = useColorModeValue("gray.500", "gray.400");
  const statLabelColor = useColorModeValue("gray.600", "gray.400");
  const statNumberColor = useColorModeValue("gray.900", "white");

  // Get user preferences
  const reduceAnimations = user?.reduceAnimations ?? false;
  const paceUnit = preferredUnit === "mi" ? "min/mi" : "min/km";

  const [searchQuery, setSearchQuery] = useState("");
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("completed");

  // Load runs from API on mount
  useEffect(() => {
    const loadRuns = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        let url = "http://localhost:5000/api/runs";
        if (statusFilter) {
          url += `?status=${statusFilter}`;
        }

        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch runs");
        }

        const data = await response.json();
        console.log("Fetched runs data:", data);

        // Handle both array response and object response with runs property
        const runsArray = Array.isArray(data) ? data : data.runs || [];

        // Sort by date (newest first) - backend already sorts but just in case
        const sortedRuns = runsArray.sort((a: Run, b: Run) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA;
        });
        setRuns(sortedRuns);
      } catch (error) {
        console.error("Failed to load runs:", error);
        setRuns([]);
      } finally {
        setLoading(false);
      }
    };
    loadRuns();
  }, [statusFilter]);

  // Filter runs based on search query
  const filteredRuns = useMemo(() => {
    if (!searchQuery.trim()) return runs;

    const query = searchQuery.toLowerCase();
    return runs.filter((run) => {
      const routeName = (run.route?.name || run.routeName || "").toLowerCase();
      const date = new Date(run.createdAt).toLocaleDateString().toLowerCase();
      return routeName.includes(query) || date.includes(query);
    });
  }, [runs, searchQuery]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (runs.length === 0)
      return {
        totalRuns: 0,
        totalDistance: 0,
        totalTime: 0,
        averagePace: 0,
      };

    const completedRuns = runs.filter((run) => run.status === "completed");
    const totalDistance = completedRuns.reduce(
      (sum, run) => sum + (run.statistics?.totalDistance || 0),
      0
    );
    const totalTime = completedRuns.reduce(
      (sum, run) => sum + (run.statistics?.totalTime || 0),
      0
    );
    const averagePace = totalDistance > 0 ? totalTime / 60 / totalDistance : 0;

    return {
      totalRuns: completedRuns.length,
      totalDistance,
      totalTime,
      averagePace,
    };
  }, [runs]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
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
      <Box
        minH="calc(100vh - 60px)"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack spacing={4}>
          <Spinner size="xl" color="teal.500" thickness="4px" />
          <Text color={textColor}>Loading run history...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box bg={pageBg} minH="calc(100vh - 60px)" py={8}>
      <Container maxW="container.xl" px={{ base: 4, md: 8 }}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box
            bg={headerBg}
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
              <VStack align="start" spacing={2}>
                <Heading size="xl" bgGradient={gradientBg} bgClip="text">
                  My Runs
                </Heading>
                <Text color={textColor} fontSize="lg">
                  Track your running progress and achievements
                </Text>
              </VStack>
            </Flex>
          </Box>

          {/* Summary Statistics */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
            <Box
              bg={cardBg}
              p={6}
              borderRadius="xl"
              border="1px"
              borderColor={borderColor}
              boxShadow="md"
            >
              <Stat>
                <StatLabel color={statLabelColor}>Total Runs</StatLabel>
                <StatNumber color="teal.500">
                  {summaryStats.totalRuns}
                </StatNumber>
                <StatHelpText color={subTextColor}>
                  <Icon as={FaRunning} mr={1} />
                  Completed
                </StatHelpText>
              </Stat>
            </Box>
            <Box
              bg={cardBg}
              p={6}
              borderRadius="xl"
              border="1px"
              borderColor={borderColor}
              boxShadow="md"
            >
              <Stat>
                <StatLabel color={statLabelColor}>Total Distance</StatLabel>
                <StatNumber color="teal.500">
                  {formatDistance(summaryStats.totalDistance)}
                </StatNumber>
                <StatHelpText color={subTextColor}>
                  <Icon as={FaRoute} mr={1} />
                  All time
                </StatHelpText>
              </Stat>
            </Box>
            <Box
              bg={cardBg}
              p={6}
              borderRadius="xl"
              border="1px"
              borderColor={borderColor}
              boxShadow="md"
            >
              <Stat>
                <StatLabel color={statLabelColor}>Total Time</StatLabel>
                <StatNumber color="teal.500">
                  {formatTime(summaryStats.totalTime)}
                </StatNumber>
                <StatHelpText color={subTextColor}>
                  <Icon as={FaClock} mr={1} />
                  Active running
                </StatHelpText>
              </Stat>
            </Box>
            <Box
              bg={cardBg}
              p={6}
              borderRadius="xl"
              border="1px"
              borderColor={borderColor}
              boxShadow="md"
            >
              <Stat>
                <StatLabel color={statLabelColor}>Average Pace</StatLabel>
                <StatNumber color="teal.500">
                  {formatPace(summaryStats.averagePace)}
                </StatNumber>
                <StatHelpText color={subTextColor}>
                  <Icon as={FaTachometerAlt} mr={1} />
                  {paceUnit}
                </StatHelpText>
              </Stat>
            </Box>
          </SimpleGrid>

          {/* Search and Filter */}
          <Flex gap={4} direction={{ base: "column", md: "row" }}>
            <InputGroup flex={1}>
              <InputLeftElement pointerEvents="none">
                <Icon as={FaSearch} color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search runs by route name or date..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                bg={cardBg}
                border="1px"
                borderColor={borderColor}
              />
            </InputGroup>
            <HStack>
              <Button
                leftIcon={<Icon as={FaFilter} />}
                variant={statusFilter === "completed" ? "solid" : "outline"}
                colorScheme="teal"
                onClick={() => setStatusFilter("completed")}
              >
                Completed
              </Button>
              <Button
                leftIcon={<Icon as={FaFilter} />}
                variant={statusFilter === "active" ? "solid" : "outline"}
                colorScheme="blue"
                onClick={() => setStatusFilter("active")}
              >
                Active
              </Button>
              <Button
                leftIcon={<Icon as={FaFilter} />}
                variant={statusFilter === "" ? "solid" : "outline"}
                colorScheme="gray"
                onClick={() => setStatusFilter("")}
              >
                All
              </Button>
            </HStack>
          </Flex>

          {/* Runs List */}
          {filteredRuns.length === 0 ? (
            <Box
              bg={cardBg}
              p={12}
              borderRadius="2xl"
              border="1px"
              borderColor={borderColor}
              textAlign="center"
            >
              <Icon as={FaRunning} boxSize={16} color="gray.400" mb={4} />
              <Heading size="md" color={headingColor} mb={2}>
                No runs found
              </Heading>
              <Text color={subTextColor} mb={6}>
                {searchQuery
                  ? "Try adjusting your search or filter"
                  : "Start running your routes to see your history here!"}
              </Text>
              {!searchQuery && (
                <Button
                  colorScheme="teal"
                  size="lg"
                  onClick={() => navigate("/my-routes")}
                  leftIcon={<Icon as={FaRunning} />}
                >
                  Browse Routes
                </Button>
              )}
            </Box>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {filteredRuns.map((run, index) => (
                <Box
                  key={run._id}
                  bg={cardBg}
                  borderRadius="xl"
                  border="1px"
                  borderColor={borderColor}
                  overflow="hidden"
                  boxShadow="md"
                  transition="all 0.3s"
                  _hover={{
                    transform: reduceAnimations ? "none" : "translateY(-4px)",
                    boxShadow: "xl",
                  }}
                  animation={
                    reduceAnimations
                      ? "none"
                      : `${fadeIn} 0.5s ease-out ${index * 0.1}s both`
                  }
                  cursor="pointer"
                  onClick={() => navigate(`/run-detail/${run._id}`)}
                >
                  <Box p={6}>
                    <Flex justify="space-between" align="start" mb={4}>
                      <VStack align="start" spacing={1} flex={1}>
                        <Heading size="md" noOfLines={1} color={headingColor}>
                          {run.route?.name || run.routeName || "Unknown Route"}
                        </Heading>
                        <HStack color={subTextColor} fontSize="sm">
                          <Icon as={FaCalendarAlt} />
                          <Text>{formatDate(run.createdAt)}</Text>
                        </HStack>
                      </VStack>
                      <Badge
                        colorScheme={getStatusColor(run.status)}
                        fontSize="sm"
                        px={2}
                        py={1}
                        borderRadius="md"
                      >
                        {run.status}
                      </Badge>
                    </Flex>

                    <VStack spacing={3} align="stretch">
                      <Flex justify="space-between" align="center">
                        <HStack color={statLabelColor}>
                          <Icon as={FaRoute} />
                          <Text fontSize="sm">Distance</Text>
                        </HStack>
                        <Text fontWeight="bold" color="teal.500">
                          {formatDistance(run.statistics?.totalDistance || 0)}
                        </Text>
                      </Flex>

                      <Flex justify="space-between" align="center">
                        <HStack color={statLabelColor}>
                          <Icon as={FaClock} />
                          <Text fontSize="sm">Time</Text>
                        </HStack>
                        <Text fontWeight="bold" color="teal.500">
                          {formatTime(run.statistics?.totalTime || 0)}
                        </Text>
                      </Flex>

                      <Flex justify="space-between" align="center">
                        <HStack color={statLabelColor}>
                          <Icon as={FaTachometerAlt} />
                          <Text fontSize="sm">Avg Pace</Text>
                        </HStack>
                        <Text fontWeight="bold" color="teal.500">
                          {formatPace(run.statistics?.averagePace || 0)}{" "}
                          {paceUnit}
                        </Text>
                      </Flex>

                      {run.statistics?.calories && (
                        <Flex justify="space-between" align="center">
                          <HStack color={statLabelColor}>
                            <Icon as={FaRunning} />
                            <Text fontSize="sm">Calories</Text>
                          </HStack>
                          <Text fontWeight="bold" color="teal.500">
                            {Math.round(run.statistics.calories)} kcal
                          </Text>
                        </Flex>
                      )}
                    </VStack>
                  </Box>
                </Box>
              ))}
            </SimpleGrid>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default RunHistory;
