/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                poppins: ['Poppins', 'sans-serif'],
                roboto: ['Roboto', 'sans-serif'],
                orbitron: ['Orbitron', 'sans-serif'],
            },
            colors: {
                'ai-bg': '#0B1120',
                'ai-navbar': '#111827',
                'ai-card': '#1F2937',
                'primary': '#22D3EE',
                'secondary': '#6366F1',
                'accent': '#10B981',
                'text-main': '#E5E7EB',
            },
        },
    },
    plugins: [],
}
