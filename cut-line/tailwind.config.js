/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // 对齐美术设计v1.3色彩体系
        income: '#4CAF50',
        expense: '#F44336',
        warning: '#FF9800',
        info: '#2196F3',
        paper: '#F5F0E8',
        ink: '#1A1A2E',
        cutline: '#FF1744',
        // 区域色
        north: '#ECEFF1',
        mid: '#F5F5F5',
        south: '#FFE0B2',
        // 时间块色
        work: '#78909C',
        overtime: '#FF7043',
        social: '#42A5F5',
        learning: '#66BB6A',
        rest: '#26C6DA',
        gray: '#7B1FA2',
      },
      fontFamily: {
        title: ['Bangers', 'cursive'],
        heading: ['Fredoka One', 'cursive'],
        body: ['Nunito', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderWidth: { '3': '3px', '4': '4px' },
    },
  },
  plugins: [],
};
