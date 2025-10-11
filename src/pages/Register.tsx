import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  useColorModeValue,
  useToast,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      await register(name, email, password);
      toast({
        title: "Account created successfully!",
        description: "Welcome to RouteMaker!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Could not create account",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="md" py={12}>
      <Box
        bg={bgColor}
        p={8}
        borderRadius="xl"
        borderWidth="1px"
        borderColor={borderColor}
        boxShadow="lg"
      >
        <Stack spacing={6}>
          <Heading
            size="xl"
            textAlign="center"
            bgGradient="linear(to-r, teal.500, blue.500)"
            bgClip="text"
          >
            Create Account
          </Heading>
          <Text textAlign="center" color="gray.600">
            Join RouteMaker today
          </Text>

          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  size="lg"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  size="lg"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  size="lg"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Confirm Password</FormLabel>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  size="lg"
                />
              </FormControl>

              <Button
                type="submit"
                size="lg"
                bgGradient="linear(to-r, teal.500, blue.500)"
                color="white"
                _hover={{
                  bgGradient: "linear(to-r, teal.600, blue.600)",
                  transform: "translateY(-2px)",
                  boxShadow: "lg",
                }}
                isLoading={isLoading}
                loadingText="Creating account..."
              >
                Sign Up
              </Button>
            </Stack>
          </form>

          <Text textAlign="center" fontSize="sm">
            Already have an account?{" "}
            <ChakraLink
              as={RouterLink}
              to="/login"
              color="teal.500"
              fontWeight="semibold"
            >
              Sign in here
            </ChakraLink>
          </Text>
        </Stack>
      </Box>
    </Container>
  );
};

export default Register;
