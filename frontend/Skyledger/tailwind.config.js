/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1E3A8A",
        accent: "#2563EB",
        bg: "#F8FAFC",
        surface: "#FFFFFF",
        "text-primary": "#0F172A",
        "text-secondary": "#64748B",
        success: "#16A34A",
        warning: "#F59E0B",
        error: "#DC2626",
        info: "#0EA5E9",
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
        'gradient-btn-hover': 'linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)',
      },
      boxShadow: {
        'soft': '0 10px 25px rgba(0, 0, 0, 0.05)',
        'hover': '0 14px 32px rgba(0, 0, 0, 0.08)',
        'glow-primary': '0 0 0 3px rgba(37, 99, 235, 0.25)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
