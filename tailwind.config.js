/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "var(--border, #e0e3db)",
        input: "var(--input, #e0e3db)",
        ring: "var(--ring, #0f766e)",
        background: "var(--background, #f6f7f3)",
        foreground: "var(--foreground, #1c221e)",
        primary: {
          DEFAULT: "var(--primary, #0f766e)",
          foreground: "var(--primary-foreground, #ffffff)",
        },
        secondary: {
          DEFAULT: "var(--secondary, #e6f4f2)",
          foreground: "var(--secondary-foreground, #115e59)",
        },
        destructive: {
          DEFAULT: "var(--destructive, #dc2626)",
          foreground: "var(--destructive-foreground, #ffffff)",
        },
        muted: {
          DEFAULT: "var(--muted, #eaece4)",
          foreground: "var(--muted-foreground, #5a645b)",
        },
        accent: {
          DEFAULT: "var(--accent, #eaece4)",
          foreground: "var(--accent-foreground, #1c221e)",
        },
        popover: {
          DEFAULT: "var(--popover, #ffffff)",
          foreground: "var(--popover-foreground, #1c221e)",
        },
        card: {
          DEFAULT: "var(--card, #ffffff)",
          foreground: "var(--card-foreground, #1c221e)",
        },
        chart: {
          1: "var(--chart-1, #84cc16)",
          2: "var(--chart-2, #0f766e)",
        },
      },
      borderRadius: {
        lg: "var(--radius, 0.75rem)",
        md: "calc(var(--radius, 0.75rem) - 2px)",
        sm: "calc(var(--radius, 0.75rem) - 4px)",
        "4xl": "2rem",
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'sans-serif'],
        heading: ['"Roboto Variable"', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
