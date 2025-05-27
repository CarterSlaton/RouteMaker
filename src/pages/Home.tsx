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
  keyframes,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { FaRoute, FaMapMarkedAlt, FaRunning } from "react-icons/fa";
import { RunnerIcon } from "../components/RunnerIcon";

const bounceAnimation = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
`;

const Home = () => {
  const navigate = useNavigate();
  const cardBg = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.200");
  const gradientStart = useColorModeValue("teal.500", "teal.200");
  const gradientEnd = useColorModeValue("brand.500", "brand.200");

  return (
    <Box
      w="100%"
      minH="calc(100vh - 80px)"
      bgGradient={`linear(to-br, ${gradientStart}10, ${gradientEnd}20)`}
      py={10}
    >
      <Container maxW="container.xl" h="100%">
        <VStack spacing={12} align="center" mb={16}>
          <Box position="relative" w="full" textAlign="center">
            <Heading
              size="2xl"
              bgGradient={`linear(to-r, ${gradientStart}, ${gradientEnd})`}
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
              color={gradientStart}
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

          <Button
            size="lg"
            colorScheme="teal"
            onClick={() => navigate("/create")}
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
        </VStack>

        <SimpleGrid
          columns={{ base: 1, md: 2, lg: 3 }}
          spacing={{ base: 8, lg: 12 }}
          mt={20}
        >
          <Feature
            icon={FaRoute}
            title="Smart Route Creation"
            description="Design your perfect running route with our intelligent map interface. Get real-time distance calculations and elevation profiles."
            gradient={`linear(to-br, ${gradientStart}, ${gradientEnd})`}
          />
          <Feature
            icon={FaMapMarkedAlt}
            title="Interactive Maps"
            description="Explore detailed street views and satellite imagery. Find the best paths and trails in your area."
            gradient={`linear(to-br, ${gradientEnd}, ${gradientStart})`}
          />
          <Feature
            icon={FaRunning}
            title="Runner Focused"
            description="Built for runners by runners. Track your progress, save favorite routes, and share with the community."
            gradient={`linear(to-br, ${gradientStart}, ${gradientEnd})`}
          />
        </SimpleGrid>
      </Container>
    </Box>
  );
};

const Feature = ({
  icon,
  title,
  description,
  gradient,
}: {
  icon: any;
  title: string;
  description: string;
  gradient: string;
}) => {
  const cardBg = useColorModeValue("white", "gray.700");
  const iconBg = useColorModeValue("teal.500", "teal.200");

  return (
    <Box
      p={8}
      bg={cardBg}
      borderRadius="xl"
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
        bg={iconBg}
        color="white"
        borderRadius="lg"
        align="center"
        justify="center"
        mb={4}
      >
        <Icon as={icon} w={6} h={6} />
      </Flex>
      <Heading size="md" mb={4} color={useColorModeValue("gray.800", "white")}>
        {title}
      </Heading>
      <Text color={useColorModeValue("gray.600", "gray.300")}>
        {description}
      </Text>
    </Box>
  );
};

export default Home;
