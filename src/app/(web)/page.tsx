'use client'

import {
  Box,
  Container,
  Heading,
  Text,
  Stack,
  Button,
  Card,
  SimpleGrid,
} from '@chakra-ui/react'
import Link from 'next/link'
import { FaBell, FaCalendarAlt, FaUser } from 'react-icons/fa'

export default function Home() {
  return (
    <Box>
      {/* Hero Section */}
      <Box bg="teal.500" color="white" py={20}>
        <Container maxW="container.xl">
          <Stack gap={6} align="center" textAlign="center">
            <Heading size="3xl" fontWeight="bold">
              이름없는 테니스 모임
            </Heading>
            <Text fontSize="xl" maxW="2xl">
              테니스 초보자들의 즐거운 모임입니다. 함께 배우고 성장하는 테니스
              커뮤니티에 참여하세요!
            </Text>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxW="container.xl" py={16}>
        <Stack gap={12}>
          <Box textAlign="center">
            <Heading size="2xl" mb={4}>
              주요 기능
            </Heading>
            <Text fontSize="lg" color="gray.600" _dark={{ color: 'gray.400' }}>
              이름없는 테니스 모임에서 제공하는 서비스를 확인하세요
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 3 }} gap={8}>
            {/* 공지사항 카드 */}
            <Card.Root>
              <Card.Body>
                <Stack gap={4} align="center" textAlign="center">
                  <Box color="teal.500" fontSize="3xl">
                    <FaBell />
                  </Box>
                  <Heading size="lg">공지사항</Heading>
                  <Text color="gray.600" _dark={{ color: 'gray.500' }}>
                    모임의 최신 소식과 중요한 공지사항을 확인하세요
                  </Text>
                  <Link href="/notice">
                    <Button colorScheme="teal" variant="outline" width="full">
                      공지사항 보기
                    </Button>
                  </Link>
                </Stack>
              </Card.Body>
            </Card.Root>

            {/* 코트 예약 카드 */}
            <Card.Root>
              <Card.Body>
                <Stack gap={4} align="center" textAlign="center">
                  <Box color="teal.500" fontSize="3xl">
                    <FaCalendarAlt />
                  </Box>
                  <Heading size="lg">일정 관리</Heading>
                  <Text color="gray.600" _dark={{ color: 'gray.500' }}>
                    편리하게 테니스 일정을 확인하고 참석하세요
                  </Text>
                  <Link href="/schedule">
                    <Button colorScheme="teal" variant="outline" width="full">
                      일정보기
                    </Button>
                  </Link>
                </Stack>
              </Card.Body>
            </Card.Root>

            {/* 프로필 관리 카드 */}
            <Card.Root>
              <Card.Body>
                <Stack gap={4} align="center" textAlign="center">
                  <Box color="teal.500" fontSize="3xl">
                    <FaUser />
                  </Box>
                  <Heading size="lg">프로필 관리</Heading>
                  <Text color="gray.600" _dark={{ color: 'gray.500' }}>
                    개인 정보를 관리하고 활동 내역을 확인하세요
                  </Text>
                  <Link href="/member">
                    <Button colorScheme="teal" variant="outline" width="full">
                      프로필 보기
                    </Button>
                  </Link>
                </Stack>
              </Card.Body>
            </Card.Root>
          </SimpleGrid>
        </Stack>
      </Container>

      {/* CTA Section */}
      {/* <Box bg='gray.200' py={16} _dark={{bg:'gray.600'}}> */}
      <Box bg="gray.200" py={16}>
        <Container maxW="container.md">
          <Stack gap={6} align="center" textAlign="center">
            <Heading size="2xl">지금 시작하세요</Heading>
            {/* <Text fontSize="lg" color="gray.600" _dark={{color: "gray.300"}}> */}
            <Text fontSize="lg" color="gray.600">
              이름없는 테니스 모임과 함께 테니스 실력을 향상시키고 새로운
              친구들을 만나보세요
            </Text>
            <Link href="/auth/sign-in">
              <Button size="lg" colorScheme="teal">
                함께하기
              </Button>
            </Link>
          </Stack>
        </Container>
      </Box>
    </Box>
  )
}
