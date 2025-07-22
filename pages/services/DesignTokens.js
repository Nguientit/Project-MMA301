// Design System - Color Palette and Constants
export const Colors = {
    // Primary Colors - Warm, food-themed palette
    primary: {
        orange: '#E67E22',      // Earth orange - main brand color
        red: '#D35400',         // Brick red - accent color
        brown: '#A04000',       // Light brown - secondary accent
    },

    // Secondary Colors
    secondary: {
        cream: '#FDEBD0',       // Cream yellow - background tint
        lightCream: '#FEF5E7',  // Lighter cream for subtle backgrounds
    },

    // Text Colors
    text: {
        primary: '#2C3E50',     // Charcoal black - main text
        secondary: '#4D5656',   // Dark gray - secondary text
        light: '#FDEBD0',       // Cream - text on dark backgrounds
        muted: '#7F8C8D',       // Muted gray - placeholder text
    },

    // Background Colors
    background: {
        primary: '#FDEBD0',     // Main background
        card: '#FFFFFF',        // Card backgrounds
        overlay: 'rgba(44, 62, 80, 0.8)', // Dark overlay
    },

    // Status Colors
    status: {
        success: '#28a745',     // Green for success states
        warning: '#FFC107',     // Yellow for warnings
        error: '#DC3545',       // Red for errors
        info: '#17a2b8',        // Blue for info
    },

    // Utility Colors
    utility: {
        border: '#E0E0E0',      // Light border color
        shadow: '#000000',      // Shadow color
        transparent: 'transparent',
    }
};

// Typography Scale
export const Typography = {
    sizes: {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 28,
        '4xl': 32,
        '5xl': 40,
    },

    weights: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
    },

    lineHeights: {
        tight: 1.2,
        normal: 1.4,
        relaxed: 1.6,
    }
};

// Spacing Scale
export const Spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
    '5xl': 48,
    '6xl': 64,
};

// Border Radius Scale
export const BorderRadius = {
    sm: 6,
    md: 8,
    lg: 12,
    xl: 15,
    '2xl': 20,
    '3xl': 25,
    full: 9999,
};

// Shadow Presets
export const Shadows = {
    sm: {
        shadowColor: Colors.utility.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },

    md: {
        shadowColor: Colors.utility.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },

    lg: {
        shadowColor: Colors.utility.shadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
    },

    xl: {
        shadowColor: Colors.utility.shadow,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 12,
    },
};

// Component Styles
export const ComponentStyles = {
    // Button Styles
    button: {
        primary: {
            backgroundColor: Colors.primary.orange,
            borderRadius: BorderRadius.lg,
            paddingVertical: Spacing.lg,
            paddingHorizontal: Spacing.xl,
            ...Shadows.md,
        },

        secondary: {
            backgroundColor: Colors.primary.red,
            borderRadius: BorderRadius.lg,
            paddingVertical: Spacing.lg,
            paddingHorizontal: Spacing.xl,
            ...Shadows.md,
        },

        outline: {
            backgroundColor: Colors.utility.transparent,
            borderWidth: 2,
            borderColor: Colors.primary.orange,
            borderRadius: BorderRadius.lg,
            paddingVertical: Spacing.lg,
            paddingHorizontal: Spacing.xl,
        },
    },

    // Card Styles
    card: {
        default: {
            backgroundColor: Colors.background.card,
            borderRadius: BorderRadius.xl,
            padding: Spacing.xl,
            ...Shadows.md,
        },

        elevated: {
            backgroundColor: Colors.background.card,
            borderRadius: BorderRadius.xl,
            padding: Spacing.xl,
            ...Shadows.lg,
        },
    },

    // Input Styles
    input: {
        default: {
            backgroundColor: Colors.background.card,
            borderRadius: BorderRadius.lg,
            paddingVertical: Spacing.md,
            paddingHorizontal: Spacing.lg,
            fontSize: Typography.sizes.base,
            color: Colors.text.primary,
            ...Shadows.sm,
        },

        focused: {
            borderWidth: 2,
            borderColor: Colors.primary.orange,
        },
    },

    // Header Styles
    header: {
        default: {
            backgroundColor: Colors.primary.orange,
            paddingTop: 50,
            paddingBottom: Spacing['2xl'],
            paddingHorizontal: Spacing.xl,
            borderBottomLeftRadius: BorderRadius['3xl'],
            borderBottomRightRadius: BorderRadius['3xl'],
        },
    },
};

// Icon Mappings for consistent iconography
export const IconMappings = {
    // Food & Restaurant
    restaurant: 'restaurant',
    food: 'fast-food',
    chef: 'person-circle',
    menu: 'menu',

    // Actions
    add: 'add',
    remove: 'remove',
    edit: 'create',
    delete: 'trash',
    save: 'checkmark',
    cancel: 'close',

    // Navigation
    back: 'arrow-back',
    forward: 'arrow-forward',
    up: 'chevron-up',
    down: 'chevron-down',

    // UI Elements
    search: 'search',
    filter: 'filter',
    settings: 'settings',
    profile: 'person',
    notification: 'notifications',

    // Status
    success: 'checkmark-circle',
    warning: 'warning',
    error: 'close-circle',
    info: 'information-circle',

    // Time & Date
    time: 'time',
    calendar: 'calendar',

    // Shopping & Orders
    cart: 'basket',
    order: 'receipt',
    payment: 'card',

    // Media
    camera: 'camera',
    gallery: 'images',

    // Categories
    mainCourse: 'restaurant',
    dessert: 'ice-cream',
    appetizer: 'wine',
    beverage: 'cafe',
    soup: 'bowl',
    salad: 'leaf',
};

// Animation Durations
export const Animations = {
    fast: 150,
    normal: 300,
    slow: 500,
};

// Breakpoints for responsive design
export const Breakpoints = {
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
};