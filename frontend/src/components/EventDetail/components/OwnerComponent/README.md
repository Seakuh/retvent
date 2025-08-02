# Guest Management Component 🎉

A beautiful and modern guest management component for event organizers to manage guest emails with a stunning UI!

## Features ✨

- **Beautiful UI**: Modern gradient design with smooth animations
- **Email Validation**: Real-time email format validation
- **Add Guests**: Add guest emails with a simple input field
- **Remove Guests**: Remove guests with a single click
- **Loading States**: Smooth loading animations and states
- **Error Handling**: User-friendly error messages with emojis
- **Success Feedback**: Success notifications for all actions
- **Responsive Design**: Works perfectly on mobile and desktop
- **Dark Mode Support**: Automatic dark mode detection

## Usage 🚀

The component is already integrated into the `OwnerComponent` and will automatically appear for event owners.

```tsx
import GuestComponent from './GuestComponent';

// The component is used in OwnerComponent.tsx
<GuestComponent eventId={eventId} />
```

## API Endpoints 📡

The component uses these backend endpoints:

- `POST /tickets` - Add a new guest
- `GET /tickets/:eventId` - Get all guests for an event
- `DELETE /tickets/:ticketId` - Remove a guest

## Features in Detail 🎯

### Email Input
- Real-time validation with visual feedback
- Enter key support for quick addition
- Beautiful focus animations
- Disabled state during loading

### Guest List
- Scrollable list with custom scrollbar
- Hover effects on guest items
- Date display for when guests were added
- Remove button with confirmation

### Loading States
- Spinning loader animations
- Disabled interactions during API calls
- Smooth transitions

### Error Handling
- User-friendly error messages
- Automatic error clearing
- Visual error indicators

### Success Feedback
- Success notifications with emojis
- Auto-dismissing messages
- Visual success indicators

## Styling 🎨

The component uses modern CSS with:
- CSS Grid and Flexbox
- CSS Custom Properties
- Smooth transitions and animations
- Gradient backgrounds
- Box shadows and blur effects
- Responsive design

## Props 📋

```tsx
interface GuestComponentProps {
  eventId: string; // The ID of the event to manage guests for
}
```

## State Management 🔄

The component manages its own state for:
- Guest list
- Loading states
- Error messages
- Success messages
- Email validation

## Accessibility ♿

- Proper ARIA labels
- Keyboard navigation support
- Screen reader friendly
- High contrast support
- Focus management

## Browser Support 🌐

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers
- Progressive enhancement

## Performance ⚡

- Optimized re-renders
- Efficient state updates
- Minimal DOM manipulation
- Smooth animations

---

Made with ❤️ and lots of emojis! 🎉 