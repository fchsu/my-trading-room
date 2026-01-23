
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'pnpm start',
      url: ['http://localhost:3000'],
      numberOfRuns: 1, // Run 1 time to save time on free tier
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
