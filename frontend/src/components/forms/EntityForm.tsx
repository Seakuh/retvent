import { useForm } from '@mantine/form';
import { Group, TextInput, Textarea, Button, Paper, Image, Text, Stack, FileButton, Select } from '@mantine/core';
import { IconUpload } from '@tabler/icons-react';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../../constants/categories';
import { LocationMap } from '../LocationMap';

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
      latitude: null as number | null,
      longitude: null as number | null,
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
    if (file) {  // Prüfe, ob eine Datei ausgewählt wurde
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImagePreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    form.setFieldValue('latitude', lat);
    form.setFieldValue('longitude', lng);
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
    <Paper p={0} className="form-container">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack spacing="lg">
          <Paper 
            className="upload-area"
            onClick={() => document.querySelector<HTMLElement>('.file-input-button')?.click()}
          >
            {imagePreview ? (
              <div className="preview-container">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  radius={0}
                  height={200}
                  fit="cover"
                  style={{ width: '100%' }}
                />
              </div>
            ) : (
              <Stack align="center" spacing="xs">
                <IconUpload size={32} color="gray" />
                <Text size="lg" color="dimmed">Upload Image</Text>
              </Stack>
            )}
            <FileButton 
              onChange={handleImageUpload} 
              accept="image/png,image/jpeg"
              className="file-input-button"
            >
              {(props) => (
                <Button {...props} variant="subtle" style={{ display: 'none' }}>
                  Select File
                </Button>
              )}
            </FileButton>
          </Paper>

          <TextInput
            required
            size="md"
            label="Name"
            placeholder={`${type === 'event' ? 'Event' : 'Location'} name`}
            {...form.getInputProps('name')}
          />

          <Textarea
            required
            size="md"
            label="Description"
            placeholder="Describe your event/location..."
            minRows={4}
            {...form.getInputProps('description')}
          />

          <Select
            required
            size="md"
            label="Category"
            placeholder="Select a category"
            data={CATEGORIES}
            searchable
            maxDropdownHeight={400}
            {...form.getInputProps('category')}
          />

          <TextInput
            required
            size="md"
            label="Address"
            placeholder="Full address"
            {...form.getInputProps('address')}
          />

          <Text size="md" weight={500} mb="xs">Location</Text>
          <LocationMap 
            onLocationSelect={handleLocationSelect}
            initialLocation={
              form.values.latitude && form.values.longitude
                ? { lat: form.values.latitude, lng: form.values.longitude }
                : undefined
            }
          />

          {type === 'event' && (
            <Group grow>
              <TextInput
                required
                type="date"
                label="Date"
                {...form.getInputProps('date')}
              />
              <TextInput
                required
                type="time"
                label="Time"
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
            fullWidth
            color="blue"
            style={{ height: '60px' }}
          >
            {type === 'event' ? 'Create Event' : 'Create Location'}
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}

