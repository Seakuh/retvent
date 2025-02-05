import { EntityForm } from '../components/forms/EntityForm';
import { Container, Title } from '@mantine/core';

export function AddLocationPage() {
  const handleSubmit = async (values: any) => {
    const formData = new FormData();
    Object.keys(values).forEach(key => {
      if (key === 'image') {
        formData.append('image', values.image);
      } else if (key === 'socialMediaLinks') {
        formData.append(key, JSON.stringify(values[key]));
      } else {
        formData.append(key, values[key]);
      }
    });

    const response = await fetch('http://localhost:3145/locations', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Failed to create location');
    }
  };

  return (
    <Container size="sm">
      <Title order={2} mb="xl">Location erstellen</Title>
      <EntityForm type="location" onSubmit={handleSubmit} />
    </Container>
  );
} 