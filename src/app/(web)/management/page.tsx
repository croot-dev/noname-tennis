'use client'

import {
  Box,
  Container,
  Heading,
  Stack,
  Card,
  Text,
} from '@chakra-ui/react'
import Link from 'next/link'
import { LuMapPin, LuUsers } from 'react-icons/lu'

const menuItems = [
  {
    label: '코트관리',
    href: '/management/court',
    icon: LuMapPin,
    description: '코트 정보를 등록하고 관리합니다',
  },
  {
    label: '회원관리',
    href: '/member',
    icon: LuUsers,
    description: '회원 목록을 조회하고 관리합니다',
  },
]

export default function ManagementPage() {
  return (
    <Container maxW="container.md" py={8}>
      <Stack gap={6}>
        <Heading size="xl" textAlign="center">
          관리
        </Heading>

        <Stack gap={3}>
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href}>
                <Card.Root
                  _hover={{ shadow: 'md', borderColor: 'teal.500' }}
                  transition="all 0.2s"
                  borderWidth="1px"
                >
                  <Card.Body padding={4}>
                    <Stack direction="row" align="center" gap={4}>
                      <Box color="teal.500">
                        <Icon size={24} />
                      </Box>
                      <Stack gap={0}>
                        <Text fontWeight="bold">{item.label}</Text>
                        <Text fontSize="sm" color="gray.500">
                          {item.description}
                        </Text>
                      </Stack>
                    </Stack>
                  </Card.Body>
                </Card.Root>
              </Link>
            )
          })}
        </Stack>
      </Stack>
    </Container>
  )
}
