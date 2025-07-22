import React, { createContext, useContext, useState, useEffect } from 'react';
import { TouchableOpacity, View, TextInput, Dimensions } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows, ComponentStyles } from './DesignTokens';

// Theme Context
const ThemeContext = createContext();

// Custom hook to use theme
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

// Light theme (default warm theme)
const lightTheme = {
    colors: Colors,
    typography: Typography,
    spacing: Spacing,
    borderRadius: BorderRadius,
    shadows: Shadows,
    components: ComponentStyles,
    isDark: false,
};

// Dark theme (warm dark variant)
const darkTheme = {
    colors: {
        ...Colors,
        // Override colors for dark theme while maintaining warmth
        primary: {
            orange: '#FF8C42',      // Brighter orange for dark mode
            red: '#FF6B35',         // Brighter red for dark mode
            brown: '#D2691E',       // Lighter brown for dark mode
        },
        secondary: {
            cream: '#2C1810',       // Dark cream background
            lightCream: '#3D2317',  // Darker cream for subtle backgrounds
        },
        text: {
            primary: '#FDEBD0',     // Light text on dark background
            secondary: '#E0C097',   // Lighter secondary text
            light: '#2C3E50',       // Dark text for light elements
            muted: '#B8860B',       // Warm muted color
        },
        background: {
            primary: '#1A1A1A',     // Dark background
            card: '#2D2D2D',        // Dark card backgrounds
            overlay: 'rgba(253, 235, 208, 0.8)', // Light overlay
        },
        status: {
            success: '#4CAF50',
            warning: '#FF9800',
            error: '#F44336',
            info: '#2196F3',
        },
        utility: {
            border: '#404040',
            shadow: '#000000',
            transparent: 'transparent',
        }
    },
    typography: Typography,
    spacing: Spacing,
    borderRadius: BorderRadius,
    shadows: Shadows,
    components: {
        ...ComponentStyles,
        // Override component styles for dark theme
        button: {
            ...ComponentStyles.button,
            primary: {
                ...ComponentStyles.button.primary,
                backgroundColor: '#FF8C42',
            },
            secondary: {
                ...ComponentStyles.button.secondary,
                backgroundColor: '#FF6B35',
            },
        },
        card: {
            ...ComponentStyles.card,
            default: {
                ...ComponentStyles.card.default,
                backgroundColor: '#2D2D2D',
            },
        },
        input: {
            ...ComponentStyles.input,
            default: {
                ...ComponentStyles.input.default,
                backgroundColor: '#2D2D2D',
                color: '#FDEBD0',
            },
        },
        header: {
            ...ComponentStyles.header,
            default: {
                ...ComponentStyles.header.default,
                backgroundColor: '#FF8C42',
            },
        },
    },
    isDark: true,
};

// Theme Provider Component
export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    const currentTheme = isDarkMode ? darkTheme : lightTheme;

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    const themeValue = {
        ...currentTheme,
        toggleTheme,
        setDarkMode: setIsDarkMode,
    };

    return (
        <ThemeContext.Provider value={themeValue}>
            {children}
        </ThemeContext.Provider>
    );
};

// Utility functions for theme-aware styling
export const createThemedStyles = (styleFunction) => {
    return (theme) => styleFunction(theme);
};

// Common themed components
export const ThemedComponents = {
    // Themed Button
    Button: ({ style, children, variant = 'primary', ...props }) => {
        const theme = useTheme();
        const buttonStyle = theme.components.button[variant];

        return (
            <TouchableOpacity style={[buttonStyle, style]} {...props}>
                {children}
            </TouchableOpacity>
        );
    },

    // Themed Card
    Card: ({ style, children, elevated = false, ...props }) => {
        const theme = useTheme();
        const cardStyle = elevated
            ? theme.components.card.elevated
            : theme.components.card.default;

        return (
            <View style={[cardStyle, style]} {...props}>
                {children}
            </View>
        );
    },

    // Themed Text Input
    TextInput: ({ style, focused = false, ...props }) => {
        const theme = useTheme();
        const inputStyle = [
            theme.components.input.default,
            focused && theme.components.input.focused,
            style
        ];

        return <TextInput style={inputStyle} {...props} />;
    },

    // Themed Text
    Text: ({ style, variant = 'body', color, ...props }) => {
        const theme = useTheme();
        const textColor = color || theme.colors.text.primary;

        const variantStyles = {
            h1: { fontSize: theme.typography.sizes['4xl'], fontWeight: theme.typography.weights.bold },
            h2: { fontSize: theme.typography.sizes['3xl'], fontWeight: theme.typography.weights.bold },
            h3: { fontSize: theme.typography.sizes['2xl'], fontWeight: theme.typography.weights.semibold },
            h4: { fontSize: theme.typography.sizes.xl, fontWeight: theme.typography.weights.semibold },
            body: { fontSize: theme.typography.sizes.base, fontWeight: theme.typography.weights.normal },
            caption: { fontSize: theme.typography.sizes.sm, fontWeight: theme.typography.weights.normal },
        };

        return (
            <Text
                style={[
                    variantStyles[variant],
                    { color: textColor },
                    style
                ]}
                {...props}
            />
        );
    },
};

// Hook for responsive design
export const useResponsive = () => {
    const [screenData, setScreenData] = useState(Dimensions.get('window'));

    useEffect(() => {
        const onChange = (result) => {
            setScreenData(result.window);
        };

        const subscription = Dimensions.addEventListener('change', onChange);
        return () => subscription?.remove();
    }, []);

    return {
        ...screenData,
        isTablet: screenData.width >= 768,
        isLandscape: screenData.width > screenData.height,
    };
};

export default ThemeProvider;