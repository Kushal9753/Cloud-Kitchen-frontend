/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#10B981', // Emerald 500
                secondary: '#34D399', // Emerald 400
                dark: '#1F2937',
                light: '#F3F4F6'
            }
        },
    },
    plugins: [],
}
