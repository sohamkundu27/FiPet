# FiPet Landing Screen

## Overview
The landing screen is the first screen users see when they open the FiPet app. It features an animated fox mascot and provides clear call-to-action buttons for new and existing users.

## Features

### 🦊 Animated Fox Mascot
- **Eye Animation**: The fox's eyes wander randomly, creating a lifelike effect
- **Tail Wagging**: The tail wags back and forth continuously
- **Bouncing Animation**: The entire fox gently bounces up and down
- **Custom Styling**: Built using React Native Views with custom styling and shadows

### 📝 Company Motto
- **Primary Tagline**: "Budget better. Think smarter."
- **Secondary Tagline**: "Raise your digital sidekick."
- **Typography**: Uses the SpaceMono font family for consistency
- **Styling**: Centered text with appropriate sizing and color hierarchy

### 🎯 Call-to-Action Buttons
- **Primary Button**: "Get Started" - Prominent purple button for new users
- **Secondary Button**: "I Already Have an Account" - Outlined button for existing users
- **Navigation**: Both buttons navigate to the login screen

## Technical Implementation

### Animations
- Uses React Native's `Animated` API
- Eye movement: Random horizontal translation with varying durations
- Tail wagging: Rotation animation with sequence timing
- Fox bouncing: Vertical translation with smooth easing

### Styling
- Light background (`#F8F9FA`)
- Purple primary color (`#4C1D95`) for brand consistency
- Orange fox color (`#FF6B35`) for warmth and friendliness
- Platform-specific shadows for iOS and elevation for Android

### Navigation
- Integrated with Expo Router
- Routes to `/login` for both new and existing users
- No header shown for clean, immersive experience

## File Structure
```
src/screens/landing/
├── LandingScreen.tsx    # Main component
└── README.md           # This documentation
```

## Usage
The landing screen is automatically displayed when users first open the app, as configured in `app/index.tsx` with a redirect to `/landing`. 