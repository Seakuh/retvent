import { Button, Group } from '@mantine/core';
import { Link } from 'react-router-dom';
import { IconPlus } from '@tabler/icons-react';

export function Navigation() {
  return (
    <Group>
      {/* ... andere Navigation Items ... */}
      <Button 
        component={Link} 
        to="/events/add" 
        leftIcon={<IconPlus size={16} />}
        variant="outline"
      >
        Event erstellen
      </Button>
      <Button 
        component={Link} 
        to="/locations/add" 
        leftIcon={<IconPlus size={16} />}
        variant="outline"
      >
        Location erstellen
      </Button>
    </Group>
  );
} 