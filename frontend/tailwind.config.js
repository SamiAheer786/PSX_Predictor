/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Lato', 'sans-serif'],
            },
            colors: {
                'aa-dark': '#0f172a',
                'aa-dark-lighter': '#1e293b',
                'aa-primary': '#3b82f6',
                'aa-secondary': '#64748b',
                'aa-green': '#10b981',
                'aa-red': '#ef4444',
                'aa-card': '#1e293b',
                'aa-text': '#f1f5f9',
                'aa-text-muted': '#94a3b8',
            }
        },
    },
    plugins: [],
}
