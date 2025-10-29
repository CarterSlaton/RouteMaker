import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  Stack,
  Text,
  useColorModeValue,
  useToast,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return "Email is required";
    }
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const subtitleColor = useColorModeValue("gray.600", "gray.400");
  const labelColor = useColorModeValue("gray.700", "gray.200");
  const inputTextColor = useColorModeValue("gray.900", "gray.100");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const emailValidation = validateEmail(email);
    if (emailValidation) {
      setEmailError(emailValidation);
      setTouched({ ...touched, email: true });
      return;
    }

    if (!password) {
      toast({
        title: "Password required",
        description: "Please enter your password",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

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

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (touched.email) {
      setEmailError(validateEmail(value));
    }
  };

  const handleEmailBlur = () => {
    setTouched({ ...touched, email: true });
    setEmailError(validateEmail(email));
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
          <Text textAlign="center" color={subtitleColor}>
            Sign in to your account
          </Text>

          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <FormControl isRequired isInvalid={touched.email && !!emailError}>
                <FormLabel color={labelColor}>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={handleEmailBlur}
                  placeholder="your.email@example.com"
                  size="lg"
                  color={inputTextColor}
                />
                {touched.email && emailError && (
                  <FormErrorMessage>{emailError}</FormErrorMessage>
                )}
                {!touched.email && (
                  <FormHelperText>
                    Enter your registered email address
                  </FormHelperText>
                )}
              </FormControl>

              <FormControl isRequired>
                <FormLabel color={labelColor}>Password</FormLabel>
                <InputGroup size="lg">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    color={inputTextColor}
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      onClick={() => setShowPassword(!showPassword)}
                      variant="ghost"
                      size="sm"
                    />
                  </InputRightElement>
                </InputGroup>
                <FormHelperText>Enter your password</FormHelperText>
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

          <Text textAlign="center" fontSize="sm" color={subtitleColor}>
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
