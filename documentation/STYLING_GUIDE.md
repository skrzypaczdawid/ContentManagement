# CMDB Application Styling Guide

This document defines the styling standards for the CMDB application, ensuring consistency across all components in both light and dark modes.

## Color Palette

### Primary Colors
- **Primary**: `#8A4FFF` (Purple) - Used for primary actions and highlights
- **Primary Hover**: `#9D6FFF` - Lighter version for hover states
- **Primary Foreground**: `#FFFFFF` - Text on primary backgrounds

### Secondary Colors
- **Secondary**: `#4ECDC4` (Pastel Teal) - Used for secondary actions
- **Secondary Hover**: `#6ED9D2` - Lighter version for hover states
- **Secondary Foreground**: `#FFFFFF` - Text on secondary backgrounds

### Accent Colors
- **Accent**: `#FFD166` (Pastel Yellow) - Used for accents and highlights
- **Accent Hover**: `#FFDA85` - Lighter version for hover states
- **Accent Foreground**: `#1A1A2E` - Text on accent backgrounds

### Neutral Colors
- **Background (Light)**: `#FFFFFF` - Main background in light mode
- **Background (Dark)**: `#2E3440` - Main background in dark mode (Nord theme)
- **Foreground (Light)**: `#1A1A2E` - Main text in light mode
- **Foreground (Dark)**: `#ECEFF4` - Main text in dark mode

### UI Colors
- **Card (Light)**: `#F9F9F9` - Card background in light mode
- **Card (Dark)**: `#3B4252` - Card background in dark mode
- **Border (Light)**: `#E2E8F0` - Borders in light mode
- **Border (Dark)**: `#4C566A` - Borders in dark mode
- **Muted (Light)**: `#F1F5F9` - Muted backgrounds in light mode
- **Muted (Dark)**: `#434C5E` - Muted backgrounds in dark mode
- **Muted Foreground (Light)**: `#64748B` - Muted text in light mode
- **Muted Foreground (Dark)**: `#D8DEE9` - Muted text in dark mode

### Status Colors
- **Success**: `#06D6A0` - Success states
- **Warning**: `#FFD166` - Warning states
- **Destructive**: `#EF476F` - Destructive actions
- **Destructive Foreground**: `#FFFFFF` - Text on destructive backgrounds

## Typography

### Font Family
- **Primary Font**: `'Barlow', sans-serif` - Clean, professional, and highly readable

### Font Sizes
- **xs**: `0.75rem` (12px)
- **sm**: `0.875rem` (14px)
- **base**: `1rem` (16px)
- **lg**: `1.125rem` (18px)
- **xl**: `1.25rem` (20px)
- **2xl**: `1.5rem` (24px)
- **3xl**: `1.875rem` (30px)
- **4xl**: `2.25rem` (36px)
- **5xl**: `3rem` (48px)

### Font Weights
- **Light**: `300`
- **Normal**: `400`
- **Medium**: `500`
- **Semibold**: `600`
- **Bold**: `700`

### Line Heights
- **Tight**: `1.25`
- **Normal**: `1.5`
- **Relaxed**: `1.75`

## Component Styles

### Buttons

#### Primary Button
- Background: Primary color
- Text: Primary foreground
- Hover: Primary hover
- Border radius: `0.5rem` (8px)
- Padding: `0.5rem 1rem` (8px 16px)
- Transition: `150ms ease`
- Shadow: Subtle elevation

#### Secondary Button
- Background: Secondary color
- Text: Secondary foreground
- Hover: Secondary hover
- Border radius: `0.5rem` (8px)
- Padding: `0.5rem 1rem` (8px 16px)
- Transition: `150ms ease`

#### Outline Button
- Background: Transparent
- Text: Foreground color
- Border: 1px solid border color
- Hover: Muted background
- Border radius: `0.5rem` (8px)
- Padding: `0.5rem 1rem` (8px 16px)
- Transition: `150ms ease`

#### Ghost Button
- Background: Transparent
- Text: Foreground color
- Hover: Muted background
- Border radius: `0.5rem` (8px)
- Padding: `0.5rem 1rem` (8px 16px)
- Transition: `150ms ease`

#### Destructive Button
- Background: Destructive color
- Text: Destructive foreground
- Hover: Darker destructive
- Border radius: `0.5rem` (8px)
- Padding: `0.5rem 1rem` (8px 16px)
- Transition: `150ms ease`

### Inputs

#### Text Input
- Background: Background color
- Text: Foreground color
- Border: 1px solid border color
- Focus: Primary color border
- Border radius: `0.375rem` (6px)
- Padding: `0.5rem` (8px)
- Height: `2.5rem` (40px)

#### Select
- Same styling as text input
- Dropdown: Card background with border

#### Checkbox & Radio
- Unchecked: Border color border
- Checked: Primary color background
- Focus: Primary color ring
- Size: `1rem` (16px)

#### Slider
- Track: Muted background
- Thumb: Primary color
- Focus: Primary color ring
- Height: `0.5rem` (8px)

### Cards
- Background: Card background
- Border: 1px solid border color
- Border radius: `0.75rem` (12px)
- Padding: `1.5rem` (24px)
- Shadow: Subtle elevation in light mode

### Alerts
- Background: Muted background
- Border: 1px solid border color
- Border radius: `0.5rem` (8px)
- Padding: `1rem` (16px)

## Dark Mode Implementation

The application supports both light and dark modes with a smooth transition between them. The dark mode uses the Nord color palette as its base, providing a comfortable viewing experience in low-light environments.

### CSS Variables

All colors are implemented as CSS variables with both light and dark mode variants. Example:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* Other light mode variables */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* Other dark mode variables */
}

