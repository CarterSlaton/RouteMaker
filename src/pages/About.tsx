import {
  Container,
  Heading,
  Text,
  VStack,
  Box,
  SimpleGrid,
  Icon,
} from "@chakra-ui/react";
import { FaRoute, FaMapMarkedAlt, FaRunning, FaSave } from "react-icons/fa";

const About = () => {
  return (
    <Container maxW="container.xl" py={6}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading size="2xl" mb={4}>
            About RouteMaker
          </Heading>
          <Text fontSize="xl" color="gray.600">
            Your personal running route creation and management tool
          </Text>
        </Box>

        <Box>
          <Heading size="lg" mb={6}>
            Features
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
            <Feature
              icon={FaRoute}
              title="Route Creation"
              description="Create custom running routes using our interactive map interface. Draw your path and see distance calculations in real-time."
            />
            <Feature
              icon={FaMapMarkedAlt}
              title="Map Integration"
              description="Powered by Mapbox, our map interface provides detailed street views and satellite imagery to help you plan the perfect route."
            />
            <Feature
              icon={FaSave}
              title="Save & Organize"
              description="Save your favorite routes and access them anytime. Organize your routes by distance, location, or difficulty."
            />
            <Feature
              icon={FaRunning}
              title="Runner-Focused"
              description="Built with runners in mind, featuring distance tracking, elevation profiles, and estimated completion times."
            />
          </SimpleGrid>
        </Box>

        <Box>
          <Heading size="lg" mb={4}>
            How to Use
          </Heading>
          <Text fontSize="lg" mb={4}>
            Getting started with RouteMaker is easy:
          </Text>
          <VStack align="stretch" spacing={4} pl={4}>
            <Text>1. Navigate to the Create Route page</Text>
            <Text>2. Use the drawing tools to map out your route</Text>
            <Text>3. Save your route with a custom name</Text>
            <Text>4. Access your saved routes anytime from My Routes</Text>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

const Feature = ({
  icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) => {
  return (
    <Box p={6} borderRadius="lg" boxShadow="md" bg="white">
      <Icon as={icon} boxSize={8} color="teal.500" mb={4} />
      <Heading size="md" mb={2}>
        {title}
      </Heading>
      <Text color="gray.600">{description}</Text>
    </Box>
  );
};

export default About;
