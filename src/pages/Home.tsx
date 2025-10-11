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
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { useNavigate } from "react-router-dom";
import {
  FaRoute,
  FaMapMarkedAlt,
  FaRunning,
  FaChevronRight,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { RunnerIcon } from "../components/RunnerIcon";

const bounceAnimation = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

const Home = () => {
  const navigate = useNavigate();
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const gradientBg = useColorModeValue(
    "linear(to-r, teal.500, blue.500)",
    "linear(to-r, teal.200, blue.200)"
  );
  const textColor = useColorModeValue("gray.600", "gray.300");

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
                maxW={{ base: "100%", md: "80%", lg: "60%" }}
                textAlign="center"
              >
                Create, save, and share your perfect running routes with our
                interactive map tool. Plan your next adventure with confidence!
              </Text>

              <HStack spacing={4}>
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
                  onClick={() => navigate("/routes")}
                  rightIcon={<Icon as={FaMapMarkerAlt} />}
                  px={8}
                  py={6}
                  fontSize="xl"
                  _hover={{
                    transform: "translateY(-4px)",
                    boxShadow: "xl",
                    bg: "teal.50",
                  }}
                  transition="all 0.3s"
                >
                  View Routes
                </Button>
              </HStack>
            </VStack>
          </Box>

          {/* Features Section */}
          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 3 }}
            spacing={{ base: 8, lg: 12 }}
            w="full"
          >
            <Feature
              icon={FaRoute}
              title="Smart Route Creation"
              description="Design your perfect running route with our intelligent map interface. Get real-time distance calculations and elevation profiles."
              gradient={gradientBg}
              cardBg={cardBg}
              borderColor={borderColor}
            />
            <Feature
              icon={FaMapMarkedAlt}
              title="Interactive Maps"
              description="Explore detailed street views and satellite imagery. Find the best paths and trails in your area."
              gradient={gradientBg}
              cardBg={cardBg}
              borderColor={borderColor}
            />
            <Feature
              icon={FaRunning}
              title="Runner Focused"
              description="Built for runners by runners. Track your progress, save favorite routes, and share with the community."
              gradient={gradientBg}
              cardBg={cardBg}
              borderColor={borderColor}
            />
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
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
