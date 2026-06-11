# GameHaton - Gaming Community Platform

A modern, high-fidelity frontend UI for a gaming community platform that connects players to form teams, chat, and schedule game sessions.

## Overview

GameHaton is built with a **premium dark mode** aesthetic featuring cutting-edge gaming UI design with neon accents, smooth animations, and an intuitive user experience.

## Features

### 1. **Landing Page**

- Bold hero section with gradient title
- Two prominent CTA buttons (Login / Sign Up)
- Animated neon orb decorations

### 2. **Authentication System**

- **Login Screen**: Email, password, and "Remember Me" functionality
- **Sign Up Screen**: Comprehensive registration form with nickname, email, password, age, and language selection

### 3. **Dashboard / Activity Feed**

- **Sidebar Navigation**: Quick access to Main, Activities, Finished, and Pending sections
- **Game Cards**: Display active gaming sessions with player counts, dates, and descriptions
- **Create Game Button**: Modal form to create new game sessions
- Responsive card-based layout

### 4. **Chat Interface**

- **User List**: Browse online team members with status indicators
- **Message Area**: Real-time chat with message timestamps
- **Session Info Panel**: Display session details, leader info, and description

### 5. **Profile Settings**

- **Account Information**: Edit nickname, email, password, language, and age
- **Integrations**: Connect Discord, Steam, and Epic Games accounts
- **Game Preferences**: Add/remove favorite games

## Visual Design System

### Color Palette

- **Primary Background**: `#0a0e27` (Deep Obsidian)
- **Secondary Background**: `#1a1f3a` (Dark Charcoal)
- **Text Primary**: `#ffffff` (Crisp White)
- **Text Secondary**: `#b0b5c8` (Light Gray)

### Neon Accents

- **Electric Blue**: `#00d4ff`
- **Neon Purple**: `#c13b7d`
- **Neon Green**: `#39ff14`
- **Neon Pink**: `#ff0080`

### Design Elements

- Minimalist, clean, geometric aesthetic
- Card-based layouts with smooth borders
- Subtle glowing effects on interactive elements
- Smooth transitions and hover states
- Responsive design for mobile, tablet, and desktop

## File Structure

```
Hackathon-GameHaton/
├── index.html          # Main HTML file with all screens
├── styles.css          # Complete design system and styling
├── script.js           # Interactivity and navigation logic
└── README.md           # Project documentation
```

## Tech Stack

- **HTML5**: Semantic markup and structure
- **CSS3**: Advanced styling with CSS variables and Grid/Flexbox
- **Vanilla JavaScript**: No dependencies, pure DOM manipulation
- **Font Awesome**: Icon library for UI elements

## Key Features Implemented

### Navigation System

- Seamless screen transitions with fade-in animation
- Active state management for sidebar navigation
- Modal system for game creation

### Form Handling

- Login form with "Remember Me" option
- Multi-step signup validation
- Profile settings with integrations
- Game creation form with modal

### Interactive Elements

- Button states (primary, secondary, outline, neon)
- Form input validation and feedback
- Chat message sending with Enter key support
- Game tag addition/removal
- User selection in chat interface

### User Experience

- Notification system with toast messages
- Smooth animations and transitions
- Responsive design breakpoints
- Keyboard event handling (Escape, Enter)
- Local storage for user data persistence

## Screen Sizes & Responsiveness

- **Desktop**: Full feature display with sidebars and panels
- **Tablet (768px)**: Optimized layout with adjusted navigation
- **Mobile (480px)**: Single-column layout with hidden sidebars

## Color Classes & Utilities

### Button Variants

- `.btn-primary`: Blue gradient with glow
- `.btn-secondary`: Purple gradient with glow
- `.btn-neon`: Pink-to-blue gradient with intense glow
- `.btn-outline`: Transparent with border and hover effect
- `.btn-lg`: Large button for CTAs
- `.btn-sm`: Small button for secondary actions
- `.btn-full`: Full-width button

### Forms

- `.form-group`: Input wrapper with label
- `.form-row`: Two-column grid for related fields
- `.form-checkbox`: Checkbox with custom styling

## Usage

1. **Landing Page**: Start here - choose to login or sign up
2. **Sign Up**: Create your gaming profile with personal information
3. **Dashboard**: Browse active games, create new sessions, join teams
4. **Chat**: Communicate with team members before and during games
5. **Profile**: Manage account settings and connect platform integrations

## JavaScript Functions

### Navigation

```javascript
navigateTo(screenId); // Navigate between screens
```

### Modal Management

```javascript
openCreateGameModal(); // Open game creation modal
closeCreateGameModal(); // Close game creation modal
```

### Form Handlers

```javascript
handleLogin(event); // Process login form
handleSignup(event); // Process signup form
handleCreateGame(event); // Process game creation
handleProfileSave(event); // Save profile changes
```

### Utilities

```javascript
showNotification(message); // Display toast notification
```

## Browser Support

- Chrome (Latest)
- Firefox (Latest)
- Safari (Latest)
- Edge (Latest)

## Accessibility Features

- Semantic HTML structure
- Proper label associations in forms
- Keyboard navigation support
- Focus states on interactive elements
- Color contrast compliance

## Animation Library

- Fade-in transitions for screens
- Slide-up animations for modals
- Float animations for decorative elements
- Hover scale and glow effects
- Smooth color transitions

## Performance Optimizations

- Minimal dependencies (no external libraries)
- CSS custom properties for efficient theming
- Hardware-accelerated animations
- Optimized image loading
- Efficient event delegation

## Future Enhancements

- Backend API integration
- Real-time chat with WebSockets
- User authentication (OAuth)
- Game session management
- Friend system and notifications
- In-game statistics and rankings
- Mobile app version

## Contributing

Guidelines for contributing to this project:

1. Maintain the design system consistency
2. Follow the naming conventions
3. Test on multiple screen sizes
4. Keep CSS organized and documented
5. Write clean, readable JavaScript

## License

This project is part of the GameHaton hackathon initiative.

---

**Created with ❤️ for gamers by gamers**

For more information, visit the GameHaton community platform.
