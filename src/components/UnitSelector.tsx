/**
 * Unit selector component for switching between km and miles
 */
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Icon,
  useToast,
} from "@chakra-ui/react";
import { FaRuler, FaCheck } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";

const UnitSelector = () => {
  const { user, updatePreferredUnit } = useAuth();
  const toast = useToast();
  const preferredUnit = user?.preferredUnit || "km";

  const handleUnitChange = async (unit: "km" | "mi") => {
    try {
      await updatePreferredUnit(unit);
      toast({
        title: "Unit preference updated",
        description: `Distance will now be displayed in ${
          unit === "km" ? "kilometers" : "miles"
        }`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      // Refresh page to update all distances
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error updating preference",
        description: "Please try again",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Menu>
      <MenuButton
        as={Button}
        leftIcon={<Icon as={FaRuler} />}
        size="sm"
        variant="ghost"
      >
        {preferredUnit.toUpperCase()}
      </MenuButton>
      <MenuList>
        <MenuItem
          onClick={() => handleUnitChange("km")}
          icon={preferredUnit === "km" ? <Icon as={FaCheck} /> : undefined}
        >
          Kilometers (km)
        </MenuItem>
        <MenuItem
          onClick={() => handleUnitChange("mi")}
          icon={preferredUnit === "mi" ? <Icon as={FaCheck} /> : undefined}
        >
          Miles (mi)
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default UnitSelector;
