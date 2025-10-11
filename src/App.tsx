import { ChakraProvider, Box, Spinner, Center } from "@chakra-ui/react";
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
const About = lazy(() => import("./pages/About"));
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

function App() {
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <Router>
          <Box minH="100vh" w="100%" display="flex" flexDirection="column">
            <Navbar />
            <Box as="main" flex="1" w="100%" p={4} overflowY="auto">
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
                    path="/about"
                    element={
                      <ProtectedRoute>
                        <About />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </Suspense>
            </Box>
          </Box>
        </Router>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;
