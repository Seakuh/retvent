import { useForm } from '@mantine/form';
import { Group, TextInput, Textarea, Button, Paper, Image, Text, Stack, FileButton, Select } from '@mantine/core';
import { IconUpload } from '@tabler/icons-react';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../../constants/categories';

interface EntityFormProps {
  type: 'event' | 'location';
  onSubmit: (values: any) => Promise<void>;
}

export function EntityForm({ type, onSubmit }: EntityFormProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const form = useForm({
    initialValues: {
      name: '',
      description: '',
      address: '',
      category: '',
      image: null as File | null,
      // Event-spezifische Felder
      ...(type === 'event' && {
        date: '',
        time: '',
      }),
      // Location-spezifische Felder
      ...(type === 'location' && {
        website: '',
        socialMediaLinks: {
          instagram: '',
          facebook: '',
          twitter: '',
        },
      }),
    },

    validate: {
      name: (value) => value.length < 2 ? 'Name muss mindestens 2 Zeichen lang sein' : null,
      description: (value) => value.length < 10 ? 'Beschreibung muss mindestens 10 Zeichen lang sein' : null,
      address: (value) => !value ? 'Adresse wird benötigt' : null,
      image: (value) => !value ? 'Bild wird benötigt' : null,
      category: (value) => !value ? 'Kategorie wird benötigt' : null,
    },
  });

  const handleImageUpload = (file: File) => {
    form.setFieldValue('image', file);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setIsSubmitting(true);
      await onSubmit(values);
      notifications.show({
        title: 'Erfolg',
        message: `${type === 'event' ? 'Event' : 'Location'} wurde erfolgreich erstellt`,
        color: 'green',
      });
      navigate(`/${type}s`);
    } catch (error) {
      notifications.show({
        title: 'Fehler',
        message: 'Etwas ist schief gelaufen',
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper p="xl" radius="md" withBorder>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack spacing="md">
          {/* Image Upload Area */}
          <Paper 
            withBorder 
            p="xl" 
            sx={(theme) => ({
              backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1],
              },
            })}
          >
            {imagePreview ? (
              <Image
                src={imagePreview}
                alt="Preview"
                radius="md"
                height={200}
                fit="cover"
              />
            ) : (
              <Stack align="center" spacing="xs">
                <IconUpload size={32} />
                <Text size="sm" color="dimmed">Bild hochladen</Text>
              </Stack>
            )}
            <FileButton onChange={handleImageUpload} accept="image/png,image/jpeg">
              {(props) => (
                <Button {...props} variant="subtle" fullWidth mt="sm">
                  {imagePreview ? 'Bild ändern' : 'Bild auswählen'}
                </Button>
              )}
            </FileButton>
          </Paper>

          <TextInput
            required
            label="Name"
            placeholder={`${type === 'event' ? 'Event' : 'Location'} Name`}
            {...form.getInputProps('name')}
          />

          <Textarea
            required
            label="Beschreibung"
            placeholder="Beschreibe dein(e) Event/Location..."
            minRows={3}
            {...form.getInputProps('description')}
          />

          <TextInput
            required
            label="Adresse"
            placeholder="Vollständige Adresse"
            {...form.getInputProps('address')}
          />

          <Select
            required
            label="Kategorie"
            placeholder="Wähle eine Kategorie"
            data={CATEGORIES}
            {...form.getInputProps('category')}
          />

          {type === 'event' && (
            <Group grow>
              <TextInput
                required
                type="date"
                label="Datum"
                {...form.getInputProps('date')}
              />
              <TextInput
                required
                type="time"
                label="Uhrzeit"
                {...form.getInputProps('time')}
              />
            </Group>
          )}

          {type === 'location' && (
            <>
              <TextInput
                label="Website"
                placeholder="https://..."
                {...form.getInputProps('website')}
              />
              <Text size="sm" weight={500} mb="xs">Social Media</Text>
              <Group grow>
                <TextInput
                  placeholder="Instagram"
                  {...form.getInputProps('socialMediaLinks.instagram')}
                />
                <TextInput
                  placeholder="Facebook"
                  {...form.getInputProps('socialMediaLinks.facebook')}
                />
                <TextInput
                  placeholder="Twitter"
                  {...form.getInputProps('socialMediaLinks.twitter')}
                />
              </Group>
            </>
          )}

          <Button 
            type="submit" 
            loading={isSubmitting}
            size="lg"
          >
            {type === 'event' ? 'Event erstellen' : 'Location erstellen'}
          </Button>
        </Stack>
      </form>
    </Paper>
  );
} 