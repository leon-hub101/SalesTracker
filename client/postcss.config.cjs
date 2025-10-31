// client/postcss.config.cjs
module.exports = {
  plugins: [
    require("tailwindcss"),     // ← NO PATH
    require("autoprefixer"),    // ← NO PATH
  ],
};