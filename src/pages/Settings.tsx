import {
  Container,
  Heading,
  Box,
  VStack,
  HStack,
  Text,
  Button,
  useColorModeValue,
  useColorMode,
  Divider,
  Switch,
  FormControl,
  FormLabel,
  Avatar,
  useToast,
  Icon,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import {
  FaSignOutAlt,
  FaRuler,
  FaUser,
  FaMoon,
  FaSun,
  FaMap,
  FaEye,
  FaGlobe,
  FaThLarge,
  FaTh,
  FaImage,
  FaBolt,
  FaFont,
} from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";

const Settings = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, logout, updatePreferredUnit, updatePreferences } = useAuth();
  const { colorMode, toggleColorMode } = useColorMode();
  const [isUpdating, setIsUpdating] = useState(false);

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.400");
  const labelBg = useColorModeValue("gray.50", "gray.700");
  const headingColor = useColorModeValue("gray.800", "white");
  const strongTextColor = useColorModeValue("gray.700", "gray.200");
  const labelTextColor = useColorModeValue("gray.800", "white");

  const preferredUnit = user?.preferredUnit || "km";
  const isMetric = preferredUnit === "km";

  // Map preferences
  const mapStyle = user?.mapStyle || "streets-v12";
  const defaultZoom = user?.defaultZoom || 12;
  const autoSaveRoutes =
    user?.autoSaveRoutes !== undefined ? user.autoSaveRoutes : true;

  // Display preferences
  const compactView = user?.compactView || false;
  const showRoutePreview =
    user?.showRoutePreview !== undefined ? user.showRoutePreview : true;
  const reduceAnimations = user?.reduceAnimations || false;
  const fontSize = user?.fontSize || "medium";

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

  const handlePreferenceToggle = async (key: string, value: any) => {
    setIsUpdating(true);
    try {
      await updatePreferences({ [key]: value });
      toast({
        title: "Preference updated",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
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

  const pageBg = useColorModeValue("gray.50", "gray.900");

  return (
    <Box bg={pageBg} minH="calc(100vh - 60px)">
      <Container maxW="4xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box>
            <Heading size="xl" mb={2} color={headingColor}>
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
              <Heading size="md" color={headingColor}>
                Profile
              </Heading>
            </HStack>
            <Divider mb={6} />
            <HStack spacing={4}>
              <Avatar size="lg" name={user.name} bg="teal.500" />
              <VStack align="start" spacing={1}>
                <Text fontSize="xl" fontWeight="bold" color={headingColor}>
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
              <Heading size="md" color={headingColor}>
                Unit Preferences
              </Heading>
            </HStack>
            <Divider mb={6} />

            <FormControl>
              <HStack justify="space-between" align="center">
                <VStack align="start" spacing={1} flex={1}>
                  <FormLabel
                    mb={0}
                    fontWeight="semibold"
                    color={labelTextColor}
                  >
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
                    <Text fontSize="sm" color={labelTextColor}>
                      Imperial
                    </Text>
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
                    <Text fontSize="sm" color={labelTextColor}>
                      Metric
                    </Text>
                  </Box>
                </HStack>
              </HStack>
            </FormControl>

            <Box mt={4} p={4} bg={labelBg} borderRadius="md">
              <Text fontSize="sm" color={textColor}>
                <Text as="span" fontWeight="bold" color={strongTextColor}>
                  Current settings:
                </Text>
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

          {/* Theme Settings Section */}
          <Box
            bg={cardBg}
            borderRadius="xl"
            border="1px"
            borderColor={borderColor}
            p={6}
            boxShadow="sm"
          >
            <HStack spacing={4} mb={4}>
              <Icon
                as={colorMode === "light" ? FaSun : FaMoon}
                boxSize={5}
                color="purple.500"
              />
              <Heading size="md" color={headingColor}>
                Appearance
              </Heading>
            </HStack>
            <Divider mb={6} />

            <FormControl>
              <HStack justify="space-between" align="center">
                <VStack align="start" spacing={1} flex={1}>
                  <FormLabel
                    mb={0}
                    fontWeight="semibold"
                    color={labelTextColor}
                  >
                    Color Mode
                  </FormLabel>
                  <Text fontSize="sm" color={textColor}>
                    {colorMode === "light"
                      ? "Currently using light mode"
                      : "Currently using dark mode"}
                  </Text>
                </VStack>
                <HStack spacing={4} align="center">
                  <Box
                    px={3}
                    py={1}
                    bg={colorMode === "light" ? labelBg : "transparent"}
                    borderRadius="md"
                    fontWeight={colorMode === "light" ? "bold" : "normal"}
                    transition="all 0.2s"
                  >
                    <HStack spacing={2}>
                      <Icon
                        as={FaSun}
                        color={
                          colorMode === "light" ? "orange.400" : "gray.400"
                        }
                      />
                      <Text fontSize="sm" color={labelTextColor}>
                        Light
                      </Text>
                    </HStack>
                  </Box>
                  <Switch
                    size="lg"
                    colorScheme="purple"
                    isChecked={colorMode === "dark"}
                    onChange={toggleColorMode}
                  />
                  <Box
                    px={3}
                    py={1}
                    bg={colorMode === "dark" ? labelBg : "transparent"}
                    borderRadius="md"
                    fontWeight={colorMode === "dark" ? "bold" : "normal"}
                    transition="all 0.2s"
                  >
                    <HStack spacing={2}>
                      <Icon
                        as={FaMoon}
                        color={colorMode === "dark" ? "blue.400" : "gray.400"}
                      />
                      <Text fontSize="sm" color={labelTextColor}>
                        Dark
                      </Text>
                    </HStack>
                  </Box>
                </HStack>
              </HStack>
            </FormControl>

            <Box mt={4} p={4} bg={labelBg} borderRadius="md">
              <Text fontSize="sm" color={textColor}>
                <Text as="span" fontWeight="bold" color={strongTextColor}>
                  Theme preference:
                </Text>{" "}
                {colorMode === "light" ? "Light Mode" : "Dark Mode"}
              </Text>
              <Text fontSize="sm" color={textColor} mt={2}>
                Switch between light and dark themes to match your preference or
                environment
              </Text>
            </Box>
          </Box>

          {/* Map Preferences Section */}
          <Box
            bg={cardBg}
            borderRadius="xl"
            border="1px"
            borderColor={borderColor}
            p={6}
            boxShadow="sm"
          >
            <HStack spacing={4} mb={4}>
              <Icon as={FaMap} boxSize={5} color="blue.500" />
              <Heading size="md" color={headingColor}>
                Map Preferences
              </Heading>
            </HStack>
            <Divider mb={6} />

            <VStack spacing={6} align="stretch">
              {/* Map Style */}
              <FormControl>
                <FormLabel color={labelTextColor} fontWeight="semibold">
                  Map Style
                </FormLabel>
                <Text fontSize="sm" color={textColor} mb={3}>
                  Choose your preferred map appearance
                </Text>
                <VStack align="stretch" spacing={2}>
                  {[
                    {
                      value: "streets-v12",
                      label: "Street Map",
                      icon: FaGlobe,
                    },
                    {
                      value: "satellite-streets-v12",
                      label: "Satellite",
                      icon: FaGlobe,
                    },
                    { value: "outdoors-v12", label: "Outdoors", icon: FaGlobe },
                    { value: "dark-v11", label: "Dark", icon: FaMoon },
                  ].map((style) => (
                    <Box
                      key={style.value}
                      p={3}
                      bg={mapStyle === style.value ? labelBg : "transparent"}
                      borderRadius="md"
                      border="1px"
                      borderColor={
                        mapStyle === style.value ? "blue.500" : borderColor
                      }
                      cursor="pointer"
                      onClick={() =>
                        handlePreferenceToggle("mapStyle", style.value)
                      }
                      transition="all 0.2s"
                      _hover={{ borderColor: "blue.300" }}
                    >
                      <HStack>
                        <Icon
                          as={style.icon}
                          color={
                            mapStyle === style.value ? "blue.500" : "gray.500"
                          }
                        />
                        <Text
                          fontWeight={
                            mapStyle === style.value ? "bold" : "normal"
                          }
                          color={labelTextColor}
                        >
                          {style.label}
                        </Text>
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              </FormControl>

              {/* Default Zoom */}
              <FormControl>
                <HStack justify="space-between" align="center">
                  <VStack align="start" spacing={1} flex={1}>
                    <FormLabel
                      mb={0}
                      fontWeight="semibold"
                      color={labelTextColor}
                    >
                      Default Zoom Level
                    </FormLabel>
                    <Text fontSize="sm" color={textColor}>
                      Starting zoom when creating routes (1-20)
                    </Text>
                  </VStack>
                  <HStack spacing={2}>
                    <Button
                      size="sm"
                      onClick={() =>
                        handlePreferenceToggle(
                          "defaultZoom",
                          Math.max(1, defaultZoom - 1)
                        )
                      }
                      isDisabled={defaultZoom <= 1 || isUpdating}
                    >
                      -
                    </Button>
                    <Text
                      fontWeight="bold"
                      minW="40px"
                      textAlign="center"
                      color={labelTextColor}
                    >
                      {defaultZoom}
                    </Text>
                    <Button
                      size="sm"
                      onClick={() =>
                        handlePreferenceToggle(
                          "defaultZoom",
                          Math.min(20, defaultZoom + 1)
                        )
                      }
                      isDisabled={defaultZoom >= 20 || isUpdating}
                    >
                      +
                    </Button>
                  </HStack>
                </HStack>
              </FormControl>

              {/* Auto-Save Routes */}
              <FormControl>
                <HStack justify="space-between" align="center">
                  <VStack align="start" spacing={1} flex={1}>
                    <FormLabel
                      mb={0}
                      fontWeight="semibold"
                      color={labelTextColor}
                    >
                      Auto-Save Routes
                    </FormLabel>
                    <Text fontSize="sm" color={textColor}>
                      Automatically save routes as drafts while drawing
                    </Text>
                  </VStack>
                  <Switch
                    size="lg"
                    colorScheme="blue"
                    isChecked={autoSaveRoutes}
                    onChange={(e) =>
                      handlePreferenceToggle("autoSaveRoutes", e.target.checked)
                    }
                    isDisabled={isUpdating}
                  />
                </HStack>
              </FormControl>
            </VStack>
          </Box>

          {/* Display Preferences Section */}
          <Box
            bg={cardBg}
            borderRadius="xl"
            border="1px"
            borderColor={borderColor}
            p={6}
            boxShadow="sm"
          >
            <HStack spacing={4} mb={4}>
              <Icon as={FaEye} boxSize={5} color="green.500" />
              <Heading size="md" color={headingColor}>
                Display Preferences
              </Heading>
            </HStack>
            <Divider mb={6} />

            <VStack spacing={6} align="stretch">
              {/* Compact View */}
              <FormControl>
                <HStack justify="space-between" align="center">
                  <VStack align="start" spacing={1} flex={1}>
                    <HStack>
                      <Icon as={compactView ? FaTh : FaThLarge} />
                      <FormLabel
                        mb={0}
                        fontWeight="semibold"
                        color={labelTextColor}
                      >
                        Compact View
                      </FormLabel>
                    </HStack>
                    <Text fontSize="sm" color={textColor}>
                      Show routes in a compact list layout
                    </Text>
                  </VStack>
                  <Switch
                    size="lg"
                    colorScheme="green"
                    isChecked={compactView}
                    onChange={(e) =>
                      handlePreferenceToggle("compactView", e.target.checked)
                    }
                    isDisabled={isUpdating}
                  />
                </HStack>
              </FormControl>

              {/* Show Route Previews */}
              <FormControl>
                <HStack justify="space-between" align="center">
                  <VStack align="start" spacing={1} flex={1}>
                    <HStack>
                      <Icon as={FaImage} />
                      <FormLabel
                        mb={0}
                        fontWeight="semibold"
                        color={labelTextColor}
                      >
                        Show Route Previews
                      </FormLabel>
                    </HStack>
                    <Text fontSize="sm" color={textColor}>
                      Display map preview images on route cards
                    </Text>
                  </VStack>
                  <Switch
                    size="lg"
                    colorScheme="green"
                    isChecked={showRoutePreview}
                    onChange={(e) =>
                      handlePreferenceToggle(
                        "showRoutePreview",
                        e.target.checked
                      )
                    }
                    isDisabled={isUpdating}
                  />
                </HStack>
              </FormControl>

              {/* Reduce Animations */}
              <FormControl>
                <HStack justify="space-between" align="center">
                  <VStack align="start" spacing={1} flex={1}>
                    <HStack>
                      <Icon as={FaBolt} />
                      <FormLabel
                        mb={0}
                        fontWeight="semibold"
                        color={labelTextColor}
                      >
                        Reduce Animations
                      </FormLabel>
                    </HStack>
                    <Text fontSize="sm" color={textColor}>
                      Minimize motion for better accessibility
                    </Text>
                  </VStack>
                  <Switch
                    size="lg"
                    colorScheme="green"
                    isChecked={reduceAnimations}
                    onChange={(e) =>
                      handlePreferenceToggle(
                        "reduceAnimations",
                        e.target.checked
                      )
                    }
                    isDisabled={isUpdating}
                  />
                </HStack>
              </FormControl>

              {/* Font Size */}
              <FormControl>
                <FormLabel color={labelTextColor} fontWeight="semibold">
                  <HStack>
                    <Icon as={FaFont} />
                    <Text>Font Size</Text>
                  </HStack>
                </FormLabel>
                <Text fontSize="sm" color={textColor} mb={3}>
                  Adjust text size for better readability
                </Text>
                <HStack spacing={2}>
                  {["small", "medium", "large"].map((size) => (
                    <Button
                      key={size}
                      flex={1}
                      variant={fontSize === size ? "solid" : "outline"}
                      colorScheme={fontSize === size ? "green" : "gray"}
                      onClick={() => handlePreferenceToggle("fontSize", size)}
                      isDisabled={isUpdating}
                      textTransform="capitalize"
                    >
                      {size}
                    </Button>
                  ))}
                </HStack>
              </FormControl>
            </VStack>
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
            <Heading size="md" mb={4} color={headingColor}>
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
    </Box>
  );
};

export default Settings;
