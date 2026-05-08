// utils/storage.js
// Storage abstraction - swap implementation for backend migration

const localStorage = require('./local-storage')

// MVP: use local storage
// Future: swap to apiStorage.js for backend
const storage = localStorage

module.exports = storage
