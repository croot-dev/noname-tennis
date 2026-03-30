import { Box, Card, Heading, HStack, Separator, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import { FaCheckCircle, FaTrophy, FaUsers } from 'react-icons/fa'
import { levelGuide } from './home.constants'

export default function IntroGuideSection() {
  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
      <Card.Root>
        <Card.Header>
          <HStack>
            <FaUsers color="var(--chakra-colors-fullcourt-pointBlue)" />
            <Heading size="md">모임 소개</Heading>
          </HStack>
        </Card.Header>
        <Card.Body>
          <VStack align="start" gap={3}>
            <HStack>
              <FaCheckCircle color="var(--chakra-colors-fullcourt-pointGreen)" />
              <Text>정기 모임: 화/토 주 2회</Text>
            </HStack>
            <HStack>
              <FaCheckCircle color="var(--chakra-colors-fullcourt-pointGreen)" />
              <Text>번개 게임: 주중 저녁 수시 오픈</Text>
            </HStack>
            <HStack>
              <FaCheckCircle color="var(--chakra-colors-fullcourt-pointGreen)" />
              <Text>회비: 월 2만원 / 1회 체험 가능</Text>
            </HStack>
            <HStack>
              <FaCheckCircle color="var(--chakra-colors-fullcourt-pointGreen)" />
              <Text>준비물: 운동화, 라켓 (초회 대여 가능)</Text>
            </HStack>
          </VStack>
        </Card.Body>
      </Card.Root>

      <Card.Root>
        <Card.Header>
          <HStack>
            <FaTrophy color="var(--chakra-colors-fullcourt-pointBlue)" />
            <Heading size="md">실력 레벨 가이드</Heading>
          </HStack>
        </Card.Header>
        <Card.Body>
          <VStack align="stretch" gap={4}>
            {levelGuide.map((guide) => (
              <Box key={guide.title}>
                <Text fontWeight="bold" mb={1}>
                  {guide.title}
                </Text>
                <Text color="gray.600">{guide.description}</Text>
                <Separator mt={3} />
              </Box>
            ))}
          </VStack>
        </Card.Body>
      </Card.Root>
    </SimpleGrid>
  )
}
