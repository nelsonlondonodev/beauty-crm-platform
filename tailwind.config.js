/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // 🛡️ Safelist: Protege estas clases para que no sean eliminadas durante el build.
  // Es vital para clases generadas dinámicamente o usadas en formatters.ts
  safelist: [
    {
      pattern: /(bg|text|border|ring)-(green|blue|red|yellow|purple|gray)-(50|100|200|500|600|700|800)/,
    },
    'line-through',
    'opacity-60',
    'fc-event--programada',
    'fc-event--completada',
    'fc-event--cancelada'
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        'card-foreground': "hsl(var(--card-foreground))",
        popover: "hsl(var(--popover))",
        'popover-foreground': "hsl(var(--popover-foreground))",
        primary: "hsl(var(--primary))",
        'primary-foreground': "hsl(var(--primary-foreground))",
        secondary: "hsl(var(--secondary))",
        'secondary-foreground': "hsl(var(--secondary-foreground))",
        muted: "hsl(var(--muted))",
        'muted-foreground': "hsl(var(--muted-foreground))",
        accent: "hsl(var(--accent))",
        'accent-foreground': "hsl(var(--accent-foreground))",
        destructive: "hsl(var(--destructive))",
        'destructive-foreground': "hsl(var(--destructive-foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
    },
  },
  plugins: [],
}
