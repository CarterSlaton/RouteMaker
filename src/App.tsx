import { ChakraProvider, Box } from "@chakra-ui/react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import CreateRoute from "./pages/CreateRoute";
import MyRoutes from "./pages/MyRoutes";
import About from "./pages/About";
import theme from "./theme";

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Router>
        <Box minH="100vh" w="100%" display="flex" flexDirection="column">
          <Navbar />
          <Box as="main" flex="1" w="100%" p={4} overflowY="auto">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/create" element={<CreateRoute />} />
              <Route path="/my-routes" element={<MyRoutes />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ChakraProvider>
  );
}

export default App;
