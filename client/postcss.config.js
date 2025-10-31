// client/postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {
      config: "../tailwind.config.js",  // ← Point to root config
    },
    autoprefixer: {},
  },
};