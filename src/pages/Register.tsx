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
  Progress,
  useColorModeValue,
  useToast,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useAuth } from "../contexts/AuthContext";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });
  const { register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  // Validation functions
  const validateName = (name: string) => {
    if (!name.trim()) {
      return "Name is required";
    }
    if (name.trim().length < 2) {
      return "Name must be at least 2 characters";
    }
    if (name.trim().length > 50) {
      return "Name must be less than 50 characters";
    }
    return "";
  };

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

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 15;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 10;
    return strength;
  };

  const getPasswordStrengthColor = (strength: number) => {
    if (strength < 40) return "red";
    if (strength < 70) return "yellow";
    return "green";
  };

  const getPasswordStrengthLabel = (strength: number) => {
    if (strength < 40) return "Weak";
    if (strength < 70) return "Medium";
    return "Strong";
  };

  const validatePassword = (password: string) => {
    if (!password) {
      return "Password is required";
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters";
    }
    return "";
  };

  const validateConfirmPassword = (confirmPassword: string, password: string) => {
    if (!confirmPassword) {
      return "Please confirm your password";
    }
    if (confirmPassword !== password) {
      return "Passwords do not match";
    }
    return "";
  };

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(confirmPassword, password);

    // Update errors and touched state
    setErrors({
      name: nameError,
      email: emailError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
    });

    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    // If any errors, don't submit
    if (nameError || emailError || passwordError || confirmPasswordError) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
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

  // Field change handlers with real-time validation
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    if (touched.name) {
      setErrors({ ...errors, name: validateName(value) });
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (touched.email) {
      setErrors({ ...errors, email: validateEmail(value) });
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (touched.password) {
      setErrors({ ...errors, password: validatePassword(value) });
    }
    if (touched.confirmPassword) {
      setErrors({ ...errors, confirmPassword: validateConfirmPassword(confirmPassword, value) });
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (touched.confirmPassword) {
      setErrors({ ...errors, confirmPassword: validateConfirmPassword(value, password) });
    }
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched({ ...touched, [field]: true });
    if (field === "name") {
      setErrors({ ...errors, name: validateName(name) });
    } else if (field === "email") {
      setErrors({ ...errors, email: validateEmail(email) });
    } else if (field === "password") {
      setErrors({ ...errors, password: validatePassword(password) });
    } else if (field === "confirmPassword") {
      setErrors({ ...errors, confirmPassword: validateConfirmPassword(confirmPassword, password) });
    }
  };

  const passwordStrength = getPasswordStrength(password);
  const passwordStrengthColor = getPasswordStrengthColor(passwordStrength);
  const passwordStrengthLabel = getPasswordStrengthLabel(passwordStrength);

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
              <FormControl isRequired isInvalid={touched.name && !!errors.name}>
                <FormLabel>Name</FormLabel>
                <Input
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  onBlur={() => handleBlur("name")}
                  placeholder="John Doe"
                  size="lg"
                />
                {touched.name && errors.name && (
                  <FormErrorMessage>{errors.name}</FormErrorMessage>
                )}
                {!errors.name && (
                  <FormHelperText>Enter your full name (2-50 characters)</FormHelperText>
                )}
              </FormControl>

              <FormControl isRequired isInvalid={touched.email && !!errors.email}>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={() => handleBlur("email")}
                  placeholder="your.email@example.com"
                  size="lg"
                />
                {touched.email && errors.email && (
                  <FormErrorMessage>{errors.email}</FormErrorMessage>
                )}
                {!errors.email && (
                  <FormHelperText>We'll never share your email</FormHelperText>
                )}
              </FormControl>

              <FormControl isRequired isInvalid={touched.password && !!errors.password}>
                <FormLabel>Password</FormLabel>
                <InputGroup size="lg">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={handlePasswordChange}
                    onBlur={() => handleBlur("password")}
                    placeholder="••••••••"
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      onClick={() => setShowPassword(!showPassword)}
                      variant="ghost"
                      size="sm"
                      tabIndex={-1}
                    />
                  </InputRightElement>
                </InputGroup>
                {touched.password && errors.password && (
                  <FormErrorMessage>{errors.password}</FormErrorMessage>
                )}
                {password && !errors.password && (
                  <Box mt={2}>
                    <Text fontSize="sm" fontWeight="medium" mb={1}>
                      Password Strength: {passwordStrengthLabel}
                    </Text>
                    <Progress
                      value={passwordStrength}
                      size="sm"
                      colorScheme={passwordStrengthColor}
                      borderRadius="full"
                    />
                  </Box>
                )}
                {!password && (
                  <FormHelperText>At least 6 characters required</FormHelperText>
                )}
              </FormControl>

              <FormControl isRequired isInvalid={touched.confirmPassword && !!errors.confirmPassword}>
                <FormLabel>Confirm Password</FormLabel>
                <InputGroup size="lg">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    onBlur={() => handleBlur("confirmPassword")}
                    placeholder="••••••••"
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      variant="ghost"
                      size="sm"
                      tabIndex={-1}
                    />
                  </InputRightElement>
                </InputGroup>
                {touched.confirmPassword && errors.confirmPassword && (
                  <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
                )}
                {!errors.confirmPassword && confirmPassword && (
                  <FormHelperText color="green.500">✓ Passwords match</FormHelperText>
                )}
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
