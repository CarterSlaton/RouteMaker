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

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast({
        title: "Login successful!",
        description: "Welcome back!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
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
            Welcome Back
          </Heading>
          <Text textAlign="center" color="gray.600">
            Sign in to your account
          </Text>

          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
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
                loadingText="Signing in..."
              >
                Sign In
              </Button>
            </Stack>
          </form>

          <Text textAlign="center" fontSize="sm">
            Don't have an account?{" "}
            <ChakraLink
              as={RouterLink}
              to="/register"
              color="teal.500"
              fontWeight="semibold"
            >
              Sign up here
            </ChakraLink>
          </Text>
        </Stack>
      </Box>
    </Container>
  );
};

export default Login;
