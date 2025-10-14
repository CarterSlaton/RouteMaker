import {
  Container,
  Heading,
  Text,
  VStack,
  Box,
  SimpleGrid,
  Icon,
  useColorModeValue,
  Flex,
  HStack,
  Badge,
  Divider,
  Stack,
} from "@chakra-ui/react";
import {
  FaHeart,
  FaLightbulb,
  FaCode,
  FaUsers,
  FaRocket,
  FaGithub,
  FaLeaf,
  FaMountain,
} from "react-icons/fa";

const About = () => {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const gradientBg = useColorModeValue(
    "linear(to-r, teal.500, blue.500)",
    "linear(to-r, teal.200, blue.200)"
  );
  const textColor = useColorModeValue("gray.600", "gray.300");
  const accentBg = useColorModeValue("teal.50", "teal.900");

  return (
    <Box
      bg={useColorModeValue("gray.50", "gray.900")}
      minH="calc(100vh - 60px)"
      py={12}
    >
      <Container maxW="container.xl" px={{ base: 4, md: 8 }}>
        <VStack spacing={16} align="stretch">
          {/* Hero Section */}
          <VStack spacing={6} textAlign="center">
            <Badge
              colorScheme="teal"
              fontSize="md"
              px={4}
              py={2}
              borderRadius="full"
            >
              🏃 Our Story
            </Badge>
            <Heading
              size="2xl"
              bgGradient={gradientBg}
              bgClip="text"
              fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
              color={useColorModeValue("gray.800", "white")}
            >
              Built by Runners, For Runners
            </Heading>
            <Text
              fontSize={{ base: "lg", md: "xl" }}
              color={textColor}
              maxW="800px"
              lineHeight="tall"
            >
              RouteMaker was born from a simple frustration: finding the perfect
              running route shouldn't be hard. We created a tool that makes
              route planning intuitive, enjoyable, and accessible to everyone.
            </Text>
          </VStack>

          {/* Our Mission */}
          <Box
            bg={cardBg}
            p={10}
            borderRadius="3xl"
            border="2px"
            borderColor="teal.500"
            boxShadow="2xl"
            position="relative"
            overflow="hidden"
          >
            <Box
              position="absolute"
              top="-50px"
              right="-50px"
              w="200px"
              h="200px"
              bgGradient={gradientBg}
              opacity="0.1"
              borderRadius="full"
            />
            <VStack spacing={6} align="start" position="relative">
              <HStack spacing={3}>
                <Icon as={FaHeart} boxSize={8} color="teal.500" />
                <Heading size="lg" color="teal.500">
                  Our Mission
                </Heading>
              </HStack>
              <Text fontSize="lg" color={textColor} lineHeight="tall">
                We believe that every runner deserves the perfect route. Whether
                you're training for a marathon, exploring a new city, or just
                looking for a scenic jog, RouteMaker empowers you to discover
                and create routes that inspire you to keep moving forward.
              </Text>
            </VStack>
          </Box>

          {/* Why We Built This */}
          <VStack spacing={8} align="stretch">
            <Heading
              size="xl"
              textAlign="center"
              color={useColorModeValue("gray.800", "white")}
            >
              Why RouteMaker Exists
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
              <ValueCard
                icon={FaLightbulb}
                title="Innovation"
                description="We saw a gap in the market for a truly user-friendly route planning tool. So we built it ourselves with modern technology and intuitive design."
                gradient={gradientBg}
                cardBg={cardBg}
                borderColor={borderColor}
              />
              <ValueCard
                icon={FaUsers}
                title="Community"
                description="Running is better together. We're building a platform where runners can share their favorite routes and discover new ones from the community."
                gradient={gradientBg}
                cardBg={cardBg}
                borderColor={borderColor}
              />
              <ValueCard
                icon={FaLeaf}
                title="Simplicity"
                description="No clutter, no confusion, no unnecessary features. Just a clean, simple tool that does exactly what you need—plan amazing routes."
                gradient={gradientBg}
                cardBg={cardBg}
                borderColor={borderColor}
              />
            </SimpleGrid>
          </VStack>

          {/* Tech Stack */}
          <Box
            bg={accentBg}
            p={10}
            borderRadius="2xl"
            border="1px"
            borderColor={borderColor}
          >
            <VStack spacing={6} align="start">
              <HStack spacing={3}>
                <Icon as={FaCode} boxSize={7} color="teal.600" />
                <Heading
                  size="lg"
                  color={useColorModeValue("teal.600", "teal.300")}
                >
                  Built With Modern Technology
                </Heading>
              </HStack>
              <Text fontSize="lg" color={textColor} lineHeight="tall">
                RouteMaker is powered by cutting-edge web technologies to ensure
                a fast, reliable, and enjoyable experience:
              </Text>
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} w="full">
                <TechBadge name="React" />
                <TechBadge name="TypeScript" />
                <TechBadge name="Mapbox GL" />
                <TechBadge name="Node.js" />
                <TechBadge name="MongoDB" />
                <TechBadge name="Express" />
                <TechBadge name="Chakra UI" />
                <TechBadge name="JWT Auth" />
              </SimpleGrid>
            </VStack>
          </Box>

          {/* Our Values */}
          <VStack spacing={8}>
            <Heading
              size="xl"
              textAlign="center"
              color={useColorModeValue("gray.800", "white")}
            >
              What Drives Us
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} w="full">
              <PrincipleCard
                icon={FaRocket}
                title="Speed & Performance"
                description="Your time is valuable. We've optimized every aspect of RouteMaker to be lightning-fast, from map loading to route calculations."
              />
              <PrincipleCard
                icon={FaMountain}
                title="Accessibility"
                description="Running should be for everyone. We're committed to making RouteMaker accessible and free for all runners, regardless of experience level."
              />
            </SimpleGrid>
          </VStack>

          {/* Open Source */}
          <Box
            bg={cardBg}
            p={10}
            borderRadius="2xl"
            border="1px"
            borderColor={borderColor}
            boxShadow="xl"
            textAlign="center"
          >
            <VStack spacing={6}>
              <Icon as={FaGithub} boxSize={12} color="teal.500" />
              <Heading size="lg" color={useColorModeValue("gray.800", "white")}>
                Open Source & Community Driven
              </Heading>
              <Text
                fontSize="lg"
                color={textColor}
                maxW="700px"
                lineHeight="tall"
              >
                RouteMaker is an open-source project built with love for the
                running community. We believe in transparency, collaboration,
                and continuous improvement. Your feedback helps us make
                RouteMaker better every day.
              </Text>
              <Divider />
              <Text fontSize="md" color={textColor} fontStyle="italic">
                "Every great route starts with a single step. Thanks for being
                part of our journey!"
              </Text>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

const ValueCard = ({
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
      boxShadow="lg"
      _hover={{
        transform: "translateY(-4px)",
        boxShadow: "2xl",
        borderColor: "teal.500",
      }}
      transition="all 0.3s ease-in-out"
    >
      <VStack spacing={4} align="center" textAlign="center">
        <Flex
          w={16}
          h={16}
          bgGradient={gradient}
          color="white"
          borderRadius="full"
          align="center"
          justify="center"
        >
          <Icon as={icon} boxSize={8} />
        </Flex>
        <Heading size="md" bgGradient={gradient} bgClip="text">
          {title}
        </Heading>
        <Text
          color={useColorModeValue("gray.600", "gray.300")}
          lineHeight="tall"
        >
          {description}
        </Text>
      </VStack>
    </Box>
  );
};

const PrincipleCard = ({
  icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Box
      p={8}
      bg={cardBg}
      borderRadius="xl"
      border="1px"
      borderColor={borderColor}
      boxShadow="md"
    >
      <Stack spacing={4}>
        <HStack spacing={3}>
          <Icon as={icon} boxSize={6} color="teal.500" />
          <Heading size="md" color={useColorModeValue("gray.800", "white")}>
            {title}
          </Heading>
        </HStack>
        <Text
          color={useColorModeValue("gray.600", "gray.300")}
          lineHeight="tall"
        >
          {description}
        </Text>
      </Stack>
    </Box>
  );
};

const TechBadge = ({ name }: { name: string }) => {
  const bg = useColorModeValue("white", "gray.700");

  return (
    <Badge
      bg={bg}
      color="teal.600"
      px={4}
      py={2}
      borderRadius="lg"
      fontSize="md"
      fontWeight="semibold"
      border="1px"
      borderColor={useColorModeValue("teal.200", "teal.700")}
      _hover={{
        transform: "scale(1.05)",
        bg: useColorModeValue("teal.50", "teal.800"),
      }}
      transition="all 0.2s"
    >
      {name}
    </Badge>
  );
};

export default About;
