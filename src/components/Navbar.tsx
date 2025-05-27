import {
  Box,
  Flex,
  Link as ChakraLink,
  Heading,
  IconButton,
  useDisclosure,
  Stack,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";

const Navbar = () => {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Box bg="teal.500" w="100%" position="sticky" top="0" zIndex="sticky">
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
          <Heading size="lg" color="white">
            RouteMaker
          </Heading>
        </RouterLink>

        <IconButton
          display={{ base: "flex", md: "none" }}
          onClick={onToggle}
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          variant="ghost"
          color="white"
          aria-label="Toggle Navigation"
          _hover={{ bg: "teal.600" }}
        />

        <Box
          display={{ base: isOpen ? "block" : "none", md: "block" }}
          flexBasis={{ base: "100%", md: "auto" }}
          mt={{ base: 4, md: 0 }}
        >
          <Stack
            spacing={6}
            align="center"
            justify={["center", "space-between", "flex-end", "flex-end"]}
            direction={["column", "column", "row", "row"]}
            pt={[4, 4, 0, 0]}
          >
            <ChakraLink
              as={RouterLink}
              to="/"
              color="white"
              fontWeight="medium"
              _hover={{ textDecoration: "none", color: "teal.100" }}
            >
              Home
            </ChakraLink>
            <ChakraLink
              as={RouterLink}
              to="/create"
              color="white"
              fontWeight="medium"
              _hover={{ textDecoration: "none", color: "teal.100" }}
            >
              Create Route
            </ChakraLink>
            <ChakraLink
              as={RouterLink}
              to="/my-routes"
              color="white"
              fontWeight="medium"
              _hover={{ textDecoration: "none", color: "teal.100" }}
            >
              My Routes
            </ChakraLink>
            <ChakraLink
              as={RouterLink}
              to="/about"
              color="white"
              fontWeight="medium"
              _hover={{ textDecoration: "none", color: "teal.100" }}
            >
              About
            </ChakraLink>
          </Stack>
        </Box>
      </Flex>
    </Box>
  );
};

export default Navbar;
