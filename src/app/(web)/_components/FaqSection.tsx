import { Box, Card, Heading, SimpleGrid, Text } from '@chakra-ui/react'
import { faqs } from './home.constants'

export default function FaqSection() {
  return (
    <Card.Root>
      <Card.Header>
        <Heading size="md">FAQ</Heading>
      </Card.Header>
      <Card.Body>
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
          {faqs.map((item) => (
            <Box
              key={item.q}
              p={4}
              borderRadius="md"
              bg="fullcourt.cardBg"
              border="1px solid"
              borderColor="fullcourt.border"
            >
              <Text fontWeight="bold" mb={2}>
                Q. {item.q}
              </Text>
              <Text color="gray.600">A. {item.a}</Text>
            </Box>
          ))}
        </SimpleGrid>
      </Card.Body>
    </Card.Root>
  )
}
