/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FF7A00",
        "primary-light": "#FF8F26",
        "primary-bg": "#FFF4E8",
        gray: {
          100: "#FAFAFA",
          200: "#F3F3F3",
          300: "#E0E0E0",
          400: "#C2C2C2",
          500: "#9A9A9A",
          600: "#6E6E6E",
          700: "#4A4A4A",
          800: "#2E2E2E",
          900: "#1A1A1A",
        },
        success: "#22C55E",
        warning: "#FACC15",
        danger: "#EF4444",
        info: "#3B82F6",
      },
      spacing: {
        xxs: "4px",
        xs: "8px",
        sm: "12px",
        md: "16px",
        lg: "20px",
        xl: "24px",
        "2xl": "32px",
        "3xl": "40px",
      },
      borderRadius: {
        sm: "6px",
        md: "12px",
        lg: "16px",
        full: "9999px",
      },
      fontSize: {
        xs: "12px",
        sm: "14px",
        md: "16px",
        lg: "18px",
        xl: "20px",
        "2xl": "24px",
      },
      fontFamily: {
        base: ["Pretendard", "sans-serif"],
      },
    },
  },
  plugins: [],
};











