import React, { useState } from 'react';
import { 
  Settings, 
  Plus, 
  Edit, 
  Trash, 
  MessageSquare, 
  Hash, 
  Volume2 
} from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import styles from './Customizer.module.css';
import { Platform, Tone, UserProfile, TextTemplate } from '../../types';

interface CustomizerProps {
  userProfile: UserProfile;
}

const Customizer: React.FC<CustomizerProps> = ({ userProfile }) => {
  const [showForm, setShowForm] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templatePlatform, setTemplatePlatform] = useState<Platform>('Instagram');
  const [templateTone, setTemplateTone] = useState<Tone>('casual');
  const [templateContent, setTemplateContent] = useState('');
  
  // Mock templates
  const [templates, setTemplates] = useState<TextTemplate[]>([
    {
      id: '1',
      name: 'Instagram Event Announcement',
      template: '🔥 BIG NEWS! [event_name] is happening on [date] at [venue]! 🎉\n\nGet ready for an unforgettable experience with [feature].\n\nTickets are limited, grab yours now at the link in bio!\n\n#[event_name] #[city] #musicfestival',
      platform: 'Instagram',
      tone: 'energetic',
    },
    {
      id: '2',
      name: 'Podcast Episode Release',
      template: 'New episode alert! 🎙️\n\nIn this week\'s [podcast_name], we dive deep into [topic] with special guest [guest_name].\n\nListen now on Spotify, Apple Podcasts, or wherever you get your podcasts!\n\n#podcast #newepisode #[topic]',
      platform: 'Twitter',
      tone: 'professional',
    },
  ]);
  
  // Platform options
  const platformOptions = [
    { value: 'Instagram', label: 'Instagram' },
    { value: 'WhatsApp', label: 'WhatsApp' },
    { value: 'Telegram', label: 'Telegram' },
    { value: 'Twitter', label: 'Twitter' },
    { value: 'Facebook', label: 'Facebook' },
    { value: 'Email', label: 'Email' },
  ];

  // Tone options
  const toneOptions = [
    { value: 'casual', label: 'Casual' },
    { value: 'emotional', label: 'Emotional' },
    { value: 'serious', label: 'Serious' },
    { value: 'professional', label: 'Professional' },
    { value: 'energetic', label: 'Energetic' },
  ];

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newTemplate: TextTemplate = {
      id: Date.now().toString(),
      name: templateName,
      template: templateContent,
      platform: templatePlatform,
      tone: templateTone,
    };
    
    setTemplates([...templates, newTemplate]);
    
    // Reset form
    setTemplateName('');
    setTemplateContent('');
    setShowForm(false);
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter(template => template.id !== id));
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Template Customizer</h2>
      <p className={styles.description}>
        Create and manage custom templates for your content generation. These templates will be
        used when generating content for different platforms.
      </p>
      
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <Settings size={18} />
          <span>Custom Templates</span>
        </div>
        
        <Button 
          variant={showForm ? 'outline' : 'primary'} 
          leftIcon={Plus} 
          onClick={() => setShowForm(!showForm)}
          style={{ marginBottom: showForm ? 'var(--space-4)' : 0 }}
        >
          {showForm ? 'Cancel' : 'Create New Template'}
        </Button>
        
        {showForm && (
          <form className={styles.form} onSubmit={handleCreateTemplate}>
            <Input
              id="templateName"
              label="Template Name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="E.g., Instagram Event Announcement"
              required
            />
            <Select
              id="templatePlatform"
              label="Platform"
              value={templatePlatform}
              onChange={(e) => setTemplatePlatform(e.target.value as Platform)}
              options={platformOptions}
            />
            <Select
              id="templateTone"
              label="Tone"
              value={templateTone}
              onChange={(e) => setTemplateTone(e.target.value as Tone)}
              options={toneOptions}
            />
            <div className={styles.fullWidth}>
              <label htmlFor="templateContent" className={styles.label}>
                Template Content
              </label>
              <textarea
                id="templateContent"
                value={templateContent}
                onChange={(e) => setTemplateContent(e.target.value)}
                placeholder="Use placeholders like [event_name], [date], [venue], etc."
                rows={6}
                style={{
                  width: '100%',
                  padding: 'var(--space-2) var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-neutral-300)',
                  fontSize: '0.875rem',
                  lineHeight: '1.5',
                }}
                required
              />
            </div>
            <div className={`${styles.formActions} ${styles.fullWidth}`} style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="submit">Save Template</Button>
            </div>
          </form>
        )}
        
        <div className={styles.templatesList}>
          {templates.map((template) => (
            <div key={template.id} className={styles.templateCard}>
              <div className={styles.templateHeader}>
                <div className={styles.templateTitle}>{template.name}</div>
                <div className={styles.templateActions}>
                  <Button variant="ghost" size="sm" leftIcon={Edit}>Edit</Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    leftIcon={Trash} 
                    onClick={() => handleDeleteTemplate(template.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
              <div className={styles.templateDetails}>
                <div className={styles.templateDetail}>
                  <MessageSquare size={14} />
                  <span>{template.platform}</span>
                </div>
                <div className={styles.templateDetail}>
                  <Volume2 size={14} />
                  <span>{template.tone}</span>
                </div>
              </div>
              <div className={styles.templateContent}>{template.template}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Customizer;