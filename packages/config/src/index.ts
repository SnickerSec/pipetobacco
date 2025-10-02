// Shared configuration constants for The Ember Society

export const APP_CONFIG = {
  name: 'The Ember Society',
  description: 'A community for pipe tobacco and cigar enthusiasts',
  version: '0.1.0',
} as const;

export const VALIDATION = {
  username: {
    minLength: 3,
    maxLength: 30,
    pattern: /^[a-zA-Z0-9_-]+$/,
  },
  password: {
    minLength: 8,
    maxLength: 100,
  },
  bio: {
    maxLength: 500,
  },
  post: {
    maxLength: 5000,
  },
  comment: {
    maxLength: 1000,
  },
} as const;

export const FILE_UPLOAD = {
  maxImageSize: 5 * 1024 * 1024, // 5MB
  maxVideoSize: 50 * 1024 * 1024, // 50MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  allowedVideoTypes: ['video/mp4', 'video/webm'],
} as const;

export const PAGINATION = {
  defaultLimit: 20,
  maxLimit: 100,
} as const;
