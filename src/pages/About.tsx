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
  List,
  ListItem,
  ListIcon,
} from "@chakra-ui/react";
import {
  FaRoute,
  FaMapMarkedAlt,
  FaRunning,
  FaSave,
  FaCheckCircle,
} from "react-icons/fa";

const About = () => {
  const headerBg = useColorModeValue("white", "gray.800");
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
          <VStack align="start" spacing={1}>
            <Heading size="xl" bgGradient={gradientBg} bgClip="text">
              About RouteMaker
            </Heading>
            <Text color="gray.500">
              Your personal running route creation and management tool
            </Text>
          </VStack>
        </Container>
      </Box>

      <Container maxW="container.xl" flex="1" px={{ base: 4, md: 8 }} pb={8}>
        <VStack spacing={12} align="stretch">
          <Box>
            <Heading
              size="lg"
              mb={8}
              bgGradient={gradientBg}
              bgClip="text"
              display="inline-block"
            >
              Features
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
              <Feature
                icon={FaRoute}
                title="Route Creation"
                description="Create custom running routes using our interactive map interface. Draw your path and see distance calculations in real-time."
                gradient={gradientBg}
                cardBg={cardBg}
                borderColor={borderColor}
              />
              <Feature
                icon={FaMapMarkedAlt}
                title="Map Integration"
                description="Powered by Mapbox, our map interface provides detailed street views and satellite imagery to help you plan the perfect route."
                gradient={gradientBg}
                cardBg={cardBg}
                borderColor={borderColor}
              />
              <Feature
                icon={FaSave}
                title="Save & Organize"
                description="Save your favorite routes and access them anytime. Organize your routes by distance, location, or difficulty."
                gradient={gradientBg}
                cardBg={cardBg}
                borderColor={borderColor}
              />
              <Feature
                icon={FaRunning}
                title="Runner-Focused"
                description="Built with runners in mind, featuring distance tracking, elevation profiles, and estimated completion times."
                gradient={gradientBg}
                cardBg={cardBg}
                borderColor={borderColor}
              />
            </SimpleGrid>
          </Box>

          <Box>
            <Heading
              size="lg"
              mb={6}
              bgGradient={gradientBg}
              bgClip="text"
              display="inline-block"
            >
              How to Use
            </Heading>
            <Box
              bg={cardBg}
              p={8}
              borderRadius="2xl"
              border="1px"
              borderColor={borderColor}
              boxShadow="xl"
              _hover={{
                transform: "translateY(-4px)",
                boxShadow: "2xl",
              }}
              transition="all 0.2s"
            >
              <Text fontSize="lg" mb={6} color={textColor}>
                Getting started with RouteMaker is easy:
              </Text>
              <List spacing={4}>
                <ListItem
                  display="flex"
                  alignItems="center"
                  fontSize="lg"
                  color={textColor}
                >
                  <ListIcon as={FaCheckCircle} color="teal.500" />
                  Navigate to the Create Route page
                </ListItem>
                <ListItem
                  display="flex"
                  alignItems="center"
                  fontSize="lg"
                  color={textColor}
                >
                  <ListIcon as={FaCheckCircle} color="teal.500" />
                  Use the drawing tools to map out your route
                </ListItem>
                <ListItem
                  display="flex"
                  alignItems="center"
                  fontSize="lg"
                  color={textColor}
                >
                  <ListIcon as={FaCheckCircle} color="teal.500" />
                  Save your route with a custom name
                </ListItem>
                <ListItem
                  display="flex"
                  alignItems="center"
                  fontSize="lg"
                  color={textColor}
                >
                  <ListIcon as={FaCheckCircle} color="teal.500" />
                  Access your saved routes anytime from My Routes
                </ListItem>
              </List>
            </Box>
          </Box>
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

export default About;
