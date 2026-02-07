import { Box, Container, Flex, Text, HStack } from '@chakra-ui/react'
import Link from 'next/link'

export default function Footer() {
  return (
    <Box as="footer" bg="gray.800" py={6}>
      <Container maxW="container.xl">
        <Flex
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align="center"
          gap={4}
        >
          <Text fontSize="sm" color="gray.400">
            © 2026 이름없는 테니스 모임
          </Text>

          <HStack gap={4}>
            <Link href="/terms/service">
              <Text fontSize="sm" color="gray.400" _hover={{ color: 'gray.700' }}>
                이용약관
              </Text>
            </Link>
            <Link href="/terms/privacy">
              <Text fontSize="sm" color="gray.400" _hover={{ color: 'gray.700' }}>
                개인정보처리방침
              </Text>
            </Link>
          </HStack>
        </Flex>
      </Container>
    </Box>
  )
}
