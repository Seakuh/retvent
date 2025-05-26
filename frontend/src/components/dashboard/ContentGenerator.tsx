import React, { useState } from 'react';
import { Copy, Sparkles, RefreshCw } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import styles from './ContentGenerator.module.css';
import { Platform, Tone, Language, EmojiLevel, UserProfile } from '../../types';

interface ContentGeneratorProps {
  userProfile: UserProfile;
}

const ContentGenerator: React.FC<ContentGeneratorProps> = ({ userProfile }) => {
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState('event');
  const [platform, setPlatform] = useState<Platform>('Instagram');
  const [tone, setTone] = useState<Tone>('energetic');
  const [language, setLanguage] = useState<Language>('English');
  const [emojiLevel, setEmojiLevel] = useState<EmojiLevel>('light');
  
  const [generatedText, setGeneratedText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Event type options
  const eventTypeOptions = [
    { value: 'event', label: 'Event' },
    { value: 'podcast', label: 'Podcast' },
    { value: 'release', label: 'Music Release' },
  ];

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

  // Language options
  const languageOptions = [
    { value: 'English', label: 'English' },
    { value: 'Spanish', label: 'Spanish' },
    { value: 'French', label: 'French' },
    { value: 'German', label: 'German' },
    { value: 'Portuguese', label: 'Portuguese' },
  ];

  // Emoji level options
  const emojiLevelOptions = [
    { value: 'none', label: 'No Emojis' },
    { value: 'light', label: 'Some Emojis' },
    { value: 'heavy', label: 'Many Emojis' },
  ];

  // Mock generated texts based on platform, tone, and emoji level
  const getGeneratedText = () => {
    const mockTexts: Record<Platform, Record<Tone, string>> = {
      Instagram: {
        casual: "Hey everyone! 👋 We're super excited about our upcoming [event_title]! Don't miss out on this amazing experience. See you there! #event #music #fun",
        emotional: "✨ Emotions will run high at our upcoming [event_title]! 💫 This is going to be a journey through sound and feeling that you won't forget. Let the music touch your soul! 🎵 #emotionaljourney #music #experience",
        serious: "Announcing [event_title]: An important gathering for industry professionals. Limited tickets available. Secure yours now. #professional #networking #industry",
        professional: "We're pleased to announce [event_title], a premium event designed for discerning attendees. Join us for an evening of quality entertainment. #premium #exclusive #event",
        energetic: "🔥 GET READY TO EXPERIENCE [event_title]! 🔥 It's going to be EPIC! 💯 Bring your energy because we're going to TURN UP! 🚀 #hype #energy #bestnight #cantwait"
      },
      WhatsApp: {
        casual: "Hey! Just letting you know about our upcoming [event_title]. It's going to be great! Hope to see you there 😊",
        emotional: "Dear friends, we're pouring our hearts into preparing [event_title] for you. It's going to be a special night filled with emotion and connection. Hope you can join us 💫",
        serious: "Important announcement: [event_title] will take place on [date]. Please RSVP by [deadline]. Limited capacity.",
        professional: "Invitation: Join us for [event_title], a professional gathering on [date] at [venue]. Please confirm your attendance.",
        energetic: "HEY PARTY PEOPLE! 🎉 You DON'T want to miss [event_title]! It's going to be AMAZING! Tell your friends! 🔥"
      },
      Telegram: {
        casual: "👋 Hey Telegram fam! We've got [event_title] coming up soon. Details below - hope to see you! 😊",
        emotional: "Dear community, we're excited to share our heartfelt project with you: [event_title]. This means so much to us, and we hope you'll be part of this emotional journey 💫",
        serious: "ANNOUNCEMENT: [event_title] - Date: [date], Venue: [venue]. Important information follows. Please read carefully.",
        professional: "Official announcement: [event_title] will take place as scheduled. All registered participants should check their email for detailed information.",
        energetic: "🚨 ATTENTION TELEGRAM FAM! 🚨 [event_title] IS HAPPENING! 🔥 DON'T MISS THIS! FORWARD TO FRIENDS! 🚀"
      },
      Twitter: {
        casual: "Hey Twitter! [event_title] is coming up soon. Tickets available at the link below. Hope to see you there! 😊",
        emotional: "Our hearts are full as we announce [event_title] - a project we've poured our souls into. Join us for an unforgettable experience 💫 #emotional #journey",
        serious: "[event_title]: Professional gathering for industry leaders. Limited spots. Registration: [link]",
        professional: "Announcing [event_title]: A premium event for industry professionals. Details and registration at the link below.",
        energetic: "🔥 [event_title] IS ABOUT TO BE THE EVENT OF THE YEAR! 🔥 RT TO SPREAD THE WORD! TICKETS SELLING FAST! #HYPED #CANTWAIT"
      },
      Facebook: {
        casual: "Hey Facebook friends! Just wanted to let you know about [event_title] coming up soon. Check out the details below and hope to see some familiar faces there! 😊",
        emotional: "Friends, we're thrilled to share something special with you. [event_title] is a project straight from our hearts to yours. This journey has been emotional, and we can't wait to share it with you all 💫",
        serious: "IMPORTANT ANNOUNCEMENT: [event_title] will take place as scheduled. Please read the following information carefully for details on venue, timing, and protocols.",
        professional: "We are pleased to announce [event_title], a gathering of industry professionals. Please find all relevant information below. We look forward to your participation.",
        energetic: "🔥🔥🔥 HUGE ANNOUNCEMENT! [event_title] IS HAPPENING AND IT'S GOING TO BE INCREDIBLE! TAG YOUR FRIENDS WHO NEED TO BE THERE! 🚀 #EXCITED #CANTWAIT"
      },
      Email: {
        casual: "Hi there,\n\nJust wanted to drop you a line about our upcoming [event_title]. It's happening on [date] at [venue], and we'd love to see you there!\n\nLet us know if you can make it.\n\nCheers,\n[name]",
        emotional: "Dear Friend,\n\nWith great emotion and anticipation, we invite you to [event_title]. This event represents a journey of passion and dedication, and we sincerely hope you'll join us for this special occasion.\n\nYour presence would mean the world to us.\n\nWarmly,\n[name]",
        serious: "Dear Recipient,\n\nThis is a formal announcement regarding [event_title] scheduled for [date] at [venue]. Your attendance is requested.\n\nPlease review the attached information and respond by the indicated deadline.\n\nRegards,\n[name]",
        professional: "Dear Valued Contact,\n\nOn behalf of [organization], I am pleased to invite you to [event_title], a professional gathering of industry leaders. The event will take place on [date] at [venue].\n\nPlease confirm your attendance at your earliest convenience.\n\nBest regards,\n[name]",
        energetic: "HEY THERE!\n\nBIG NEWS! WE'RE HOSTING [event_title] AND IT'S GOING TO BE AMAZING!\n\nDATE: [date]\nTIME: [time]\nVENUE: [venue]\n\nYOU DON'T WANT TO MISS THIS! RSVP NOW!\n\nEXCITEDLY YOURS,\n[name]"
      }
    };

    // Replace [event_title] with actual title
    let text = mockTexts[platform][tone].replace(/\[event_title\]/g, title || 'our event');
    
    // Adjust emoji count based on emojiLevel
    if (emojiLevel === 'none') {
      text = text.replace(/[^\w\s.,;:'"!?()[\]{}\-_+=<>@#$%^&*|~`]/g, '');
    } else if (emojiLevel === 'heavy' && platform !== 'Email') {
      const extraEmojis = ['🔥', '💯', '✨', '💫', '🚀', '🎉', '🎵', '👍', '❤️', '😍'];
      for (let i = 0; i < 5; i++) {
        const randomEmoji = extraEmojis[Math.floor(Math.random() * extraEmojis.length)];
        text = text.replace(/[.!?](?=\s|$)/, randomEmoji + '$&');
      }
    }

    return text;
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setGeneratedText(getGeneratedText());
      setIsGenerating(false);
      setHasGenerated(true);
    }, 1000);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generatedText);
  };

  const handleRegenerateText = () => {
    setIsGenerating(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setGeneratedText(getGeneratedText());
      setIsGenerating(false);
    }, 1000);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Content Generator</h2>
      <form className={styles.form} onSubmit={handleGenerate}>
        <Input
          id="title"
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter event/podcast/release title"
          required
        />
        <Select
          id="eventType"
          label="Type"
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
          options={eventTypeOptions}
        />
        <Select
          id="platform"
          label="Platform"
          value={platform}
          onChange={(e) => setPlatform(e.target.value as Platform)}
          options={platformOptions}
        />
        <Select
          id="tone"
          label="Tone"
          value={tone}
          onChange={(e) => setTone(e.target.value as Tone)}
          options={toneOptions}
        />
        <Select
          id="language"
          label="Language"
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
          options={languageOptions}
        />
        <Select
          id="emojiLevel"
          label="Emoji Level"
          value={emojiLevel}
          onChange={(e) => setEmojiLevel(e.target.value as EmojiLevel)}
          options={emojiLevelOptions}
        />
        <div className={`${styles.formActions} ${styles.fullWidth}`}>
          <Button 
            type="submit" 
            leftIcon={Sparkles}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate Text'}
          </Button>
        </div>
      </form>
      
      {hasGenerated && (
        <div className={styles.output}>
          <div className={styles.outputHeader}>
            <div className={styles.outputTitle}>Generated {platform} Post</div>
            <div className={styles.outputActions}>
              <Button 
                variant="outline" 
                size="sm" 
                leftIcon={RefreshCw} 
                onClick={handleRegenerateText}
                disabled={isGenerating}
              >
                Regenerate
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                leftIcon={Copy} 
                onClick={handleCopyToClipboard}
              >
                Copy
              </Button>
            </div>
          </div>
          <div className={`${styles.generatedText} ${styles[platform.toLowerCase()]}`}>
            {generatedText}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentGenerator;