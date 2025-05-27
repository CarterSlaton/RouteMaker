import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  SimpleGrid,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <Container
      maxW="container.xl"
      py={10}
      h="100%"
      display="flex"
      flexDirection="column"
    >
      <VStack spacing={8} textAlign="center" mb={12} flex="1">
        <Heading
          size="2xl"
          bgGradient="linear(to-r, teal.500, teal.300)"
          bgClip="text"
          fontSize={{ base: "4xl", md: "5xl", lg: "6xl" }}
        >
          Welcome to RouteMaker
        </Heading>
        <Text
          fontSize={{ base: "lg", md: "xl" }}
          color="gray.600"
          maxW={{ base: "100%", md: "80%", lg: "60%" }}
        >
          Create, save, and share your perfect running routes with our
          interactive map tool.
        </Text>
        <Button
          size="lg"
          colorScheme="teal"
          onClick={() => navigate("/create")}
          px={8}
          py={6}
          fontSize="xl"
          _hover={{
            transform: "translateY(-2px)",
            boxShadow: "lg",
          }}
          transition="all 0.2s"
        >
          Create New Route
        </Button>
      </VStack>

      <SimpleGrid
        columns={{ base: 1, md: 2, lg: 3 }}
        spacing={{ base: 5, md: 8, lg: 10 }}
        w="100%"
      >
        <Feature
          title="Create Routes"
          description="Design your perfect running route using our interactive map tool. Add waypoints, measure distance, and save your routes."
        />
        <Feature
          title="Save Favorites"
          description="Save your favorite routes and access them anytime. Perfect for keeping track of your regular running paths."
        />
        <Feature
          title="Track Progress"
          description="View detailed information about your routes including distance, elevation, and estimated completion time."
        />
      </SimpleGrid>
    </Container>
  );
};

const Feature = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <Box
    p={6}
    borderRadius="lg"
    boxShadow="md"
    bg="white"
    _hover={{
      transform: "translateY(-5px)",
      boxShadow: "xl",
    }}
    transition="all 0.2s"
  >
    <Heading size="md" mb={4}>
      {title}
    </Heading>
    <Text color="gray.600">{description}</Text>
  </Box>
);

export default Home;
