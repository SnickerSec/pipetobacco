import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import * as db from '@ember-society/database';

const prisma = db.prisma;

export function initializePassport() {
  // Configure Google OAuth Strategy
  console.log('🔧 Configuring Google OAuth:', {
    hasClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    clientId: process.env.GOOGLE_CLIENT_ID?.substring(0, 20) + '...',
  });

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    console.log('✅ Google OAuth strategy registered');
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Check if user exists with this Google ID
            let user = await prisma.user.findUnique({
              where: { googleId: profile.id },
            });

            if (!user) {
              // Check if user exists with this email
              const email = profile.emails?.[0]?.value;
              if (email) {
                user = await prisma.user.findUnique({
                  where: { email },
                });

                if (user) {
                  // Link Google account to existing user
                  user = await prisma.user.update({
                    where: { id: user.id },
                    data: { googleId: profile.id },
                  });
                }
              }

              // Create new user if doesn't exist
              if (!user && email) {
                const displayName = profile.displayName || email.split('@')[0];
                const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_-]/g, '');

                // Ensure username is unique
                let finalUsername = username;
                let counter = 1;
                while (await prisma.user.findUnique({ where: { username: finalUsername } })) {
                  finalUsername = `${username}${counter}`;
                  counter++;
                }

                user = await prisma.user.create({
                  data: {
                    email,
                    googleId: profile.id,
                    username: finalUsername,
                    displayName,
                    avatarUrl: profile.photos?.[0]?.value,
                    isVerified: true, // Email verified through Google
                  },
                });
              }
            }

            if (!user) {
              return done(new Error('Unable to create or find user'), undefined);
            }

            // Update last login
            await prisma.user.update({
              where: { id: user.id },
              data: { lastLoginAt: new Date() },
            });

            return done(null, user);
          } catch (error) {
            return done(error as Error, undefined);
          }
        }
      )
    );
  }

  // Configure Facebook OAuth Strategy
  if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(
      new FacebookStrategy(
        {
          clientID: process.env.FACEBOOK_APP_ID,
          clientSecret: process.env.FACEBOOK_APP_SECRET,
          callbackURL: process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:3000/api/auth/facebook/callback',
          profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Check if user exists with this Facebook ID
            let user = await prisma.user.findUnique({
              where: { facebookId: profile.id },
            });

            if (!user) {
              // Check if user exists with this email
              const email = profile.emails?.[0]?.value;
              if (email) {
                user = await prisma.user.findUnique({
                  where: { email },
                });

                if (user) {
                  // Link Facebook account to existing user
                  user = await prisma.user.update({
                    where: { id: user.id },
                    data: { facebookId: profile.id },
                  });
                }
              }

              // Create new user if doesn't exist
              if (!user && email) {
                const displayName = `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim() || email.split('@')[0];
                const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_-]/g, '');

                // Ensure username is unique
                let finalUsername = username;
                let counter = 1;
                while (await prisma.user.findUnique({ where: { username: finalUsername } })) {
                  finalUsername = `${username}${counter}`;
                  counter++;
                }

                user = await prisma.user.create({
                  data: {
                    email,
                    facebookId: profile.id,
                    username: finalUsername,
                    displayName,
                    avatarUrl: profile.photos?.[0]?.value,
                    isVerified: true, // Email verified through Facebook
                  },
                });
              }
            }

            if (!user) {
              return done(new Error('Unable to create or find user'), undefined);
            }

            // Update last login
            await prisma.user.update({
              where: { id: user.id },
              data: { lastLoginAt: new Date() },
            });

            return done(null, user);
          } catch (error) {
            return done(error as Error, undefined);
          }
        }
      )
    );
  }
}

export default passport;
