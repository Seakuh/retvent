import { EntityForm } from '../components/forms/EntityForm';
import { Container, Title } from '@mantine/core';

export function AddEventPage() {
  const handleSubmit = async (values: any) => {
    const formData = new FormData();
    Object.keys(values).forEach(key => {
      if (key === 'image') {
        formData.append('image', values.image);
      } else {
        formData.append(key, values[key]);
      }
    });

    const response = await fetch('http://localhost:3145/events', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to create event');
    }
  };

  return (
    <Container size="sm">
      <Title order={2} mb="xl">Event erstellen</Title>
      <EntityForm type="event" onSubmit={handleSubmit} />
    </Container>
  );
} 