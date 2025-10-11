import { Box, Skeleton, SkeletonText, Stack } from "@chakra-ui/react";

const RouteCardSkeleton = () => {
  return (
    <Box
      p={6}
      bg="white"
      borderRadius="lg"
      borderWidth="1px"
      borderColor="gray.200"
      boxShadow="sm"
    >
      <Stack spacing={4}>
        <Skeleton height="24px" width="60%" />
        <SkeletonText noOfLines={2} spacing="4" skeletonHeight="2" />
        <Stack direction="row" spacing={4}>
          <Skeleton height="20px" width="80px" />
          <Skeleton height="20px" width="80px" />
          <Skeleton height="20px" width="80px" />
        </Stack>
      </Stack>
    </Box>
  );
};

export default RouteCardSkeleton;
