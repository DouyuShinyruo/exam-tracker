// utils/storage.js
// Storage abstraction - swap implementation for backend migration

const localStorage = require('./local-storage')
// const apiStorage = require('./api-storage')

// Set to true to use backend API instead of local storage
const USE_API = false

const storage = USE_API ? null : localStorage // Replace null with apiStorage when USE_API is true

module.exports = storage
