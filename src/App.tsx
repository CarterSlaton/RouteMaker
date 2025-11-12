import {
  ChakraProvider,
  Box,
  Spinner,
  Center,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { lazy, Suspense } from "react";
import Navbar from "./components/Navbar";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import theme from "./theme";

// Lazy load pages for code splitting
const Home = lazy(() => import("./pages/Home"));
const CreateRoute = lazy(() => import("./pages/CreateRoute"));
const MyRoutes = lazy(() => import("./pages/MyRoutes"));
const RouteDetails = lazy(() => import("./pages/RouteDetails"));
const RunRoute = lazy(() => import("./pages/RunRoute"));
const RunHistory = lazy(() => import("./pages/RunHistory"));
const RunDetail = lazy(() => import("./pages/RunDetail"));
const About = lazy(() => import("./pages/About"));
const Settings = lazy(() => import("./pages/Settings"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));

// Loading fallback component
const PageLoader = () => (
  <Center h="50vh">
    <Spinner
      thickness="4px"
      speed="0.65s"
      emptyColor="gray.200"
      color="teal.500"
      size="xl"
    />
  </Center>
);

// Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <Box>Loading...</Box>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Font size wrapper component
const FontSizeWrapper = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const fontSize = user?.fontSize || "medium";

  // Map font size to CSS values
  const fontSizeMap = {
    small: "0.875rem", // 14px
    medium: "1rem", // 16px (default)
    large: "1.125rem", // 18px
  };

  return (
    <Box fontSize={fontSizeMap[fontSize]} transition="font-size 0.2s">
      {children}
    </Box>
  );
};

// App content wrapper to use color mode
const AppContent = () => {
  const appBg = useColorModeValue("gray.50", "gray.900");

  return (
    <Router future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <Box
        minH="100vh"
        w="100%"
        display="flex"
        flexDirection="column"
        bg={appBg}
      >
        <Navbar />
        <FontSizeWrapper>
          <Box as="main" flex="1" w="100%" overflowY="auto" bg={appBg}>
            <Box p={4}>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <Home />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/create"
                    element={
                      <ProtectedRoute>
                        <CreateRoute />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/my-routes"
                    element={
                      <ProtectedRoute>
                        <MyRoutes />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/route/:id"
                    element={
                      <ProtectedRoute>
                        <RouteDetails />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/run/:routeId"
                    element={
                      <ProtectedRoute>
                        <RunRoute />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/runs"
                    element={
                      <ProtectedRoute>
                        <RunHistory />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/run-detail/:runId"
                    element={
                      <ProtectedRoute>
                        <RunDetail />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/about"
                    element={
                      <ProtectedRoute>
                        <About />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <Settings />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </Suspense>
            </Box>
          </Box>
        </FontSizeWrapper>
      </Box>
    </Router>
  );
};

function App() {
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;
