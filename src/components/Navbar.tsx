import {
  Box,
  Flex,
  Link as ChakraLink,
  Heading,
  IconButton,
  useDisclosure,
  Stack,
  useColorModeValue,
  Button,
  Text,
  Avatar,
  Icon,
} from "@chakra-ui/react";
import type { SystemStyleObject } from "@chakra-ui/react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import { FaCog } from "react-icons/fa";
import { RunnerIcon } from "./RunnerIcon";
import { useAuth } from "../contexts/AuthContext";

const UserSection = () => {
  const { user } = useAuth();
  const textColor = useColorModeValue("gray.800", "white");

  if (!user) return null;

  return (
    <Flex align="center" gap={3}>
      <Flex align="center" gap={2}>
        <Avatar size="sm" name={user.name} bg="teal.500" />
        <Text
          display={{ base: "none", md: "block" }}
          fontWeight="medium"
          color={textColor}
        >
          {user.name}
        </Text>
      </Flex>
      <Button
        as={RouterLink}
        to="/settings"
        leftIcon={<Icon as={FaCog} />}
        colorScheme="teal"
        variant="outline"
        size="sm"
      >
        Settings
      </Button>
    </Flex>
  );
};

const Navbar = () => {
  const { isOpen, onToggle } = useDisclosure();
  const location = useLocation();
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const isActive = (path: string) => location.pathname === path;

  const inactiveColor = useColorModeValue("gray.600", "gray.300");

  const navLinkStyles = (path: string): SystemStyleObject => ({
    position: "relative" as const,
    color: isActive(path) ? "teal.500" : inactiveColor,
    fontWeight: "medium",
    textDecoration: "none",
    transition: "all 0.3s ease",
    _hover: {
      textDecoration: "none",
      color: "teal.500",
    },
    _after: {
      content: '""',
      position: "absolute",
      width: isActive(path) ? "100%" : "0",
      height: "2px",
      bottom: "-4px",
      left: "0",
      bg: "teal.500",
      transition: "all 0.3s ease",
    },
    _groupHover: {
      _after: {
        width: "100%",
      },
    },
  });

  return (
    <Box
      bg={bg}
      borderBottom="1px"
      borderColor={borderColor}
      position="sticky"
      top="0"
      zIndex="sticky"
      transition="all 0.3s ease-in-out"
      boxShadow="sm"
    >
      <Flex
        w="100%"
        maxW={{ xl: "1200px" }}
        mx="auto"
        px={4}
        py={3}
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
      >
        <RouterLink to="/" style={{ textDecoration: "none" }}>
          <Flex align="center" gap={2}>
            <RunnerIcon boxSize={8} color="teal.500" />
            <Heading
              size="lg"
              bgGradient="linear(to-r, teal.500, brand.500)"
              bgClip="text"
              _hover={{
                bgGradient: "linear(to-r, teal.400, brand.400)",
              }}
              transition="all 0.3s ease"
            >
              RouteMaker
            </Heading>
          </Flex>
        </RouterLink>

        <IconButton
          display={{ base: "flex", md: "none" }}
          onClick={onToggle}
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          variant="ghost"
          color="teal.500"
          aria-label="Toggle Navigation"
          _hover={{ bg: "teal.50" }}
        />

        <Flex
          display={{ base: isOpen ? "flex" : "none", md: "flex" }}
          flexBasis={{ base: "100%", md: "auto" }}
          mt={{ base: 4, md: 0 }}
          alignItems="center"
          gap={6}
        >
          <Stack
            spacing={8}
            align="center"
            justify={["center", "space-between", "flex-end"]}
            direction={["column", "row"]}
            pt={[4, 4, 0]}
          >
            {[
              { path: "/", label: "Home" },
              { path: "/create", label: "Create Route" },
              { path: "/my-routes", label: "My Routes" },
              { path: "/runs", label: "My Runs" },
              { path: "/about", label: "About" },
            ].map(({ path, label }) => (
              <Box key={path} role="group">
                <ChakraLink as={RouterLink} to={path} sx={navLinkStyles(path)}>
                  {label}
                </ChakraLink>
              </Box>
            ))}
          </Stack>
          <UserSection />
        </Flex>
      </Flex>
    </Box>
  );
};

export default Navbar;
