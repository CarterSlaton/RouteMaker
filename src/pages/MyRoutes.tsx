import {
  Container,
  Heading,
  SimpleGrid,
  Box,
  Text,
  Button,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const MyRoutes = () => {
  const navigate = useNavigate();

  // This would typically come from your backend
  const mockRoutes = [
    { id: 1, name: "Morning Run", distance: 5.2, date: "2024-03-20" },
    { id: 2, name: "Park Loop", distance: 3.8, date: "2024-03-19" },
    { id: 3, name: "City Trail", distance: 7.5, date: "2024-03-18" },
  ];

  return (
    <Container maxW="container.xl" py={6}>
      <Heading mb={6}>My Routes</Heading>

      {mockRoutes.length === 0 ? (
        <Box textAlign="center" py={10}>
          <Text fontSize="xl" mb={4}>
            You haven't created any routes yet.
          </Text>
          <Button colorScheme="teal" onClick={() => navigate("/create")}>
            Create Your First Route
          </Button>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {mockRoutes.map((route) => (
            <Box
              key={route.id}
              p={6}
              borderRadius="lg"
              boxShadow="md"
              bg="white"
              _hover={{ transform: "translateY(-2px)", transition: "all 0.2s" }}
              cursor="pointer"
            >
              <Heading size="md" mb={2}>
                {route.name}
              </Heading>
              <Text color="gray.600" mb={2}>
                Distance: {route.distance} km
              </Text>
              <Text color="gray.500" fontSize="sm">
                Created: {route.date}
              </Text>
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Container>
  );
};

export default MyRoutes;
