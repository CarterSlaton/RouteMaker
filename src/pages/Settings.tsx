import {
  Container,
  Heading,
  Box,
  VStack,
  HStack,
  Text,
  Button,
  useColorModeValue,
  Divider,
  Switch,
  FormControl,
  FormLabel,
  Avatar,
  useToast,
  Icon,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaRuler, FaUser } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";

const Settings = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, logout, updatePreferredUnit } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.400");
  const labelBg = useColorModeValue("gray.50", "gray.700");

  const preferredUnit = user?.preferredUnit || "km";
  const isMetric = preferredUnit === "km";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleUnitToggle = async () => {
    setIsUpdating(true);
    try {
      const newUnit = isMetric ? "mi" : "km";
      await updatePreferredUnit(newUnit);
      toast({
        title: "Unit preference updated",
        description: `Distance will now be displayed in ${
          newUnit === "km" ? "metric (kilometers)" : "imperial (miles)"
        }`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      // Refresh page to update all distances
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error updating preference",
        description: "Please try again",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <Container maxW="4xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="xl" mb={2}>
            Settings
          </Heading>
          <Text color={textColor}>Manage your account and preferences</Text>
        </Box>

        {/* User Profile Section */}
        <Box
          bg={cardBg}
          borderRadius="xl"
          border="1px"
          borderColor={borderColor}
          p={6}
          boxShadow="sm"
        >
          <HStack spacing={4} mb={4}>
            <Icon as={FaUser} boxSize={5} color="teal.500" />
            <Heading size="md">Profile</Heading>
          </HStack>
          <Divider mb={6} />
          <HStack spacing={4}>
            <Avatar size="lg" name={user.name} bg="teal.500" />
            <VStack align="start" spacing={1}>
              <Text fontSize="xl" fontWeight="bold">
                {user.name}
              </Text>
              <Text color={textColor}>{user.email}</Text>
            </VStack>
          </HStack>
        </Box>

        {/* Unit Preferences Section */}
        <Box
          bg={cardBg}
          borderRadius="xl"
          border="1px"
          borderColor={borderColor}
          p={6}
          boxShadow="sm"
        >
          <HStack spacing={4} mb={4}>
            <Icon as={FaRuler} boxSize={5} color="teal.500" />
            <Heading size="md">Unit Preferences</Heading>
          </HStack>
          <Divider mb={6} />

          <FormControl>
            <HStack justify="space-between" align="center">
              <VStack align="start" spacing={1} flex={1}>
                <FormLabel mb={0} fontWeight="semibold">
                  Distance Units
                </FormLabel>
                <Text fontSize="sm" color={textColor}>
                  {isMetric
                    ? "Using metric units (kilometers, meters)"
                    : "Using imperial units (miles, feet)"}
                </Text>
              </VStack>
              <HStack spacing={4} align="center">
                <Box
                  px={3}
                  py={1}
                  bg={!isMetric ? labelBg : "transparent"}
                  borderRadius="md"
                  fontWeight={!isMetric ? "bold" : "normal"}
                  transition="all 0.2s"
                >
                  <Text fontSize="sm">Imperial</Text>
                </Box>
                <Switch
                  size="lg"
                  colorScheme="teal"
                  isChecked={isMetric}
                  onChange={handleUnitToggle}
                  isDisabled={isUpdating}
                />
                <Box
                  px={3}
                  py={1}
                  bg={isMetric ? labelBg : "transparent"}
                  borderRadius="md"
                  fontWeight={isMetric ? "bold" : "normal"}
                  transition="all 0.2s"
                >
                  <Text fontSize="sm">Metric</Text>
                </Box>
              </HStack>
            </HStack>
          </FormControl>

          <Box mt={4} p={4} bg={labelBg} borderRadius="md">
            <Text fontSize="sm" color={textColor}>
              <strong>Current settings:</strong>
            </Text>
            <VStack align="start" spacing={1} mt={2}>
              <Text fontSize="sm" color={textColor}>
                • Distance: {isMetric ? "Kilometers (km)" : "Miles (mi)"}
              </Text>
              <Text fontSize="sm" color={textColor}>
                • Elevation: {isMetric ? "Meters (m)" : "Feet (ft)"}
              </Text>
              <Text fontSize="sm" color={textColor}>
                • Short distances: {isMetric ? "Meters (m)" : "Feet (ft)"}
              </Text>
            </VStack>
          </Box>
        </Box>

        {/* Account Actions Section */}
        <Box
          bg={cardBg}
          borderRadius="xl"
          border="1px"
          borderColor={borderColor}
          p={6}
          boxShadow="sm"
        >
          <Heading size="md" mb={4}>
            Account Actions
          </Heading>
          <Divider mb={6} />

          <VStack spacing={4} align="stretch">
            <Button
              leftIcon={<Icon as={FaSignOutAlt} />}
              colorScheme="red"
              variant="outline"
              size="lg"
              onClick={handleLogout}
              w="full"
            >
              Sign Out
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default Settings;
