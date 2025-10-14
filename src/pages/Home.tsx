import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  SimpleGrid,
  useColorModeValue,
  Icon,
  Flex,
  HStack,
  Badge,
  List,
  ListItem,
  ListIcon,
  Divider,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { useNavigate } from "react-router-dom";
import {
  FaRoute,
  FaMapMarkedAlt,
  FaRunning,
  FaChevronRight,
  FaMapMarkerAlt,
  FaUserPlus,
  FaLock,
  FaCheck,
  FaStar,
  FaChartLine,
} from "react-icons/fa";
import { RunnerIcon } from "../components/RunnerIcon";
import { useAuth } from "../contexts/AuthContext";

const bounceAnimation = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const gradientBg = useColorModeValue(
    "linear(to-r, teal.500, blue.500)",
    "linear(to-r, teal.200, blue.200)"
  );
  const textColor = useColorModeValue("gray.600", "gray.300");
  const highlightBg = useColorModeValue("teal.50", "teal.900");

  return (
    <Box
      bg={useColorModeValue("gray.50", "gray.900")}
      minH="calc(100vh - 60px)"
      display="flex"
      flexDirection="column"
      py={12}
    >
      <Container maxW="container.xl" px={{ base: 4, md: 8 }}>
        <VStack spacing={16} align="center">
          {/* Hero Section */}
          <Box position="relative" w="full" textAlign="center">
            <VStack spacing={8}>
              <Box position="relative">
                <Badge
                  colorScheme="teal"
                  fontSize="md"
                  px={4}
                  py={2}
                  borderRadius="full"
                  mb={4}
                >
                  🚀 Plan Your Perfect Run
                </Badge>
                <Heading
                  size="2xl"
                  bgGradient={gradientBg}
                  bgClip="text"
                  fontSize={{ base: "4xl", md: "5xl", lg: "6xl" }}
                  mb={4}
                >
                  Welcome to RouteMaker
                </Heading>
                <Icon
                  as={RunnerIcon}
                  w={20}
                  h={20}
                  color="teal.500"
                  position="absolute"
                  top="-30px"
                  right={{ base: "10%", md: "20%" }}
                  animation={`${bounceAnimation} 3s ease-in-out infinite`}
                />
              </Box>

              <Text
                fontSize={{ base: "lg", md: "xl" }}
                color={textColor}
                maxW={{ base: "100%", md: "80%", lg: "70%" }}
                textAlign="center"
                lineHeight="tall"
              >
                The ultimate tool for runners to create, save, and share custom
                running routes. Plan your next adventure with precision using
                our interactive mapping technology!
              </Text>

              {!user ? (
                <VStack spacing={4} w="full">
                  <HStack spacing={4} flexWrap="wrap" justify="center">
                    <Button
                      size="lg"
                      colorScheme="teal"
                      onClick={() => navigate("/register")}
                      rightIcon={<Icon as={FaUserPlus} />}
                      px={8}
                      py={6}
                      fontSize="xl"
                      _hover={{
                        transform: "translateY(-4px)",
                        boxShadow: "xl",
                      }}
                      transition="all 0.3s"
                    >
                      Sign Up Free
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      colorScheme="teal"
                      onClick={() => navigate("/login")}
                      rightIcon={<Icon as={FaLock} />}
                      px={8}
                      py={6}
                      fontSize="xl"
                      _hover={{
                        transform: "translateY(-4px)",
                        boxShadow: "xl",
                        bg: highlightBg,
                      }}
                      transition="all 0.3s"
                    >
                      Login
                    </Button>
                  </HStack>
                  <Text fontSize="sm" color={textColor}>
                    ✨ No credit card required • Takes less than 30 seconds
                  </Text>
                </VStack>
              ) : (
                <HStack spacing={4} flexWrap="wrap" justify="center">
                  <Button
                    size="lg"
                    colorScheme="teal"
                    onClick={() => navigate("/create")}
                    rightIcon={<Icon as={FaChevronRight} />}
                    px={8}
                    py={6}
                    fontSize="xl"
                    _hover={{
                      transform: "translateY(-4px)",
                      boxShadow: "xl",
                    }}
                    transition="all 0.3s"
                  >
                    Start Creating Routes
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    colorScheme="teal"
                    onClick={() => navigate("/my-routes")}
                    rightIcon={<Icon as={FaMapMarkerAlt} />}
                    px={8}
                    py={6}
                    fontSize="xl"
                    _hover={{
                      transform: "translateY(-4px)",
                      boxShadow: "xl",
                      bg: highlightBg,
                    }}
                    transition="all 0.3s"
                  >
                    My Routes
                  </Button>
                </HStack>
              )}
            </VStack>
          </Box>

          {/* Getting Started Section - Only show if not logged in */}
          {!user && (
            <Box
              w="full"
              bg={cardBg}
              borderRadius="2xl"
              p={8}
              border="2px"
              borderColor="teal.500"
              boxShadow="xl"
            >
              <VStack spacing={6}>
                <Heading size="lg" textAlign="center" color="teal.500">
                  🎯 Get Started in 3 Easy Steps
                </Heading>
                <Divider />
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} w="full">
                  <StepCard
                    stepNumber="1"
                    title="Create Your Account"
                    description="Sign up in seconds with just your name, email, and password. It's completely free!"
                    icon={FaUserPlus}
                  />
                  <StepCard
                    stepNumber="2"
                    title="Design Your Route"
                    description="Use our interactive map to plot your perfect running route. Click to add waypoints and see distance instantly."
                    icon={FaMapMarkedAlt}
                  />
                  <StepCard
                    stepNumber="3"
                    title="Save & Run"
                    description="Save your routes to access anytime. Track your favorites and build your personal route collection!"
                    icon={FaRunning}
                  />
                </SimpleGrid>
                <Button
                  colorScheme="teal"
                  size="lg"
                  onClick={() => navigate("/register")}
                  rightIcon={<Icon as={FaChevronRight} />}
                  mt={4}
                >
                  Create Free Account Now
                </Button>
              </VStack>
            </Box>
          )}

          {/* Features Section */}
          <VStack spacing={8} w="full">
            <Heading
              size="xl"
              textAlign="center"
              color={useColorModeValue("gray.800", "white")}
            >
              Why Runners Love RouteMaker
            </Heading>
            <SimpleGrid
              columns={{ base: 1, md: 2, lg: 3 }}
              spacing={{ base: 8, lg: 12 }}
              w="full"
            >
              <Feature
                icon={FaRoute}
                title="Smart Route Creation"
                description="Design your perfect running route with our intelligent map interface. Get real-time distance calculations as you plot your path."
                gradient={gradientBg}
                cardBg={cardBg}
                borderColor={borderColor}
              />
              <Feature
                icon={FaMapMarkedAlt}
                title="Interactive Maps"
                description="Explore detailed street views and satellite imagery. Find the best paths, trails, and hidden gems in your area."
                gradient={gradientBg}
                cardBg={cardBg}
                borderColor={borderColor}
              />
              <Feature
                icon={FaRunning}
                title="Runner Focused"
                description="Built by runners, for runners. Every feature is designed to help you plan better runs and achieve your goals."
                gradient={gradientBg}
                cardBg={cardBg}
                borderColor={borderColor}
              />
              <Feature
                icon={FaLock}
                title="Secure & Private"
                description="Your routes and data are safely stored with secure authentication. Your privacy is our priority."
                gradient={gradientBg}
                cardBg={cardBg}
                borderColor={borderColor}
              />
              <Feature
                icon={FaChartLine}
                title="Track Your Progress"
                description="Build a library of your favorite routes. Keep track of your running repertoire and revisit your best runs."
                gradient={gradientBg}
                cardBg={cardBg}
                borderColor={borderColor}
              />
              <Feature
                icon={FaStar}
                title="Always Free"
                description="All features are completely free, forever. No hidden costs, no premium tiers, no credit card needed."
                gradient={gradientBg}
                cardBg={cardBg}
                borderColor={borderColor}
              />
            </SimpleGrid>
          </VStack>

          {/* Benefits List */}
          <Box
            w="full"
            bg={highlightBg}
            borderRadius="2xl"
            p={8}
            border="1px"
            borderColor={borderColor}
          >
            <VStack spacing={6} align="start">
              <Heading size="lg" color="teal.600">
                What You Get With RouteMaker
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                <List spacing={3}>
                  <ListItem>
                    <ListIcon as={FaCheck} color="teal.500" />
                    Unlimited route creation
                  </ListItem>
                  <ListItem>
                    <ListIcon as={FaCheck} color="teal.500" />
                    Save routes to your personal library
                  </ListItem>
                  <ListItem>
                    <ListIcon as={FaCheck} color="teal.500" />
                    Real-time distance tracking
                  </ListItem>
                  <ListItem>
                    <ListIcon as={FaCheck} color="teal.500" />
                    Interactive map with multiple views
                  </ListItem>
                </List>
                <List spacing={3}>
                  <ListItem>
                    <ListIcon as={FaCheck} color="teal.500" />
                    Mobile-friendly design
                  </ListItem>
                  <ListItem>
                    <ListIcon as={FaCheck} color="teal.500" />
                    Secure cloud storage
                  </ListItem>
                  <ListItem>
                    <ListIcon as={FaCheck} color="teal.500" />
                    Easy route management
                  </ListItem>
                  <ListItem>
                    <ListIcon as={FaCheck} color="teal.500" />
                    100% free, no ads
                  </ListItem>
                </List>
              </SimpleGrid>
            </VStack>
          </Box>

          {/* Final CTA */}
          {!user && (
            <Box textAlign="center" py={8}>
              <VStack spacing={4}>
                <Heading size="lg">Ready to Plan Your Next Run?</Heading>
                <Text fontSize="lg" color={textColor}>
                  Join runners who are already using RouteMaker to discover new
                  paths!
                </Text>
                <Button
                  size="lg"
                  colorScheme="teal"
                  onClick={() => navigate("/register")}
                  rightIcon={<Icon as={FaUserPlus} />}
                  px={12}
                  py={6}
                  fontSize="xl"
                  _hover={{
                    transform: "scale(1.05)",
                    boxShadow: "2xl",
                  }}
                  transition="all 0.3s"
                >
                  Get Started Free
                </Button>
              </VStack>
            </Box>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

const StepCard = ({
  stepNumber,
  title,
  description,
  icon,
}: {
  stepNumber: string;
  title: string;
  description: string;
  icon: any;
}) => {
  const cardBg = useColorModeValue("white", "gray.700");
  const numberBg = useColorModeValue("teal.500", "teal.400");

  return (
    <VStack spacing={4} align="center" textAlign="center">
      <Flex
        w={16}
        h={16}
        bg={numberBg}
        color="white"
        borderRadius="full"
        align="center"
        justify="center"
        fontSize="2xl"
        fontWeight="bold"
        position="relative"
      >
        {stepNumber}
        <Icon
          as={icon}
          position="absolute"
          bottom="-8px"
          right="-8px"
          bg={cardBg}
          p={1}
          borderRadius="full"
          boxSize={8}
          color={numberBg}
        />
      </Flex>
      <Heading size="md" color="teal.600">
        {title}
      </Heading>
      <Text color={useColorModeValue("gray.600", "gray.300")}>
        {description}
      </Text>
    </VStack>
  );
};

const Feature = ({
  icon,
  title,
  description,
  gradient,
  cardBg,
  borderColor,
}: {
  icon: any;
  title: string;
  description: string;
  gradient: string;
  cardBg: string;
  borderColor: string;
}) => {
  return (
    <Box
      p={8}
      bg={cardBg}
      borderRadius="2xl"
      border="1px"
      borderColor={borderColor}
      boxShadow="xl"
      position="relative"
      overflow="hidden"
      _hover={{
        transform: "translateY(-8px)",
        boxShadow: "2xl",
      }}
      transition="all 0.3s ease-in-out"
    >
      <Box
        position="absolute"
        top="-20px"
        right="-20px"
        w="100px"
        h="100px"
        bgGradient={gradient}
        opacity="0.1"
        borderRadius="full"
      />
      <Flex
        w={12}
        h={12}
        bgGradient={gradient}
        color="white"
        borderRadius="xl"
        align="center"
        justify="center"
        mb={4}
      >
        <Icon as={icon} w={6} h={6} />
      </Flex>
      <Heading size="md" mb={4} bgGradient={gradient} bgClip="text">
        {title}
      </Heading>
      <Text color={useColorModeValue("gray.600", "gray.300")}>
        {description}
      </Text>
    </Box>
  );
};

export default Home;
