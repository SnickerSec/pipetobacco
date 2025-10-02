import { Router } from 'express';
import passport from '../config/passport.js';
import { generateToken } from '../services/jwtService.js';
import { User } from '@prisma/client';

const router = Router();

// Google OAuth Routes
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_auth_failed`,
  }),
  (req, res) => {
    const user = req.user as User;
    const token = generateToken(user);

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?token=${token}`);
  }
);

// Facebook OAuth Routes
router.get(
  '/facebook',
  passport.authenticate('facebook', {
    scope: ['email'],
    session: false,
  })
);

router.get(
  '/facebook/callback',
  passport.authenticate('facebook', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=facebook_auth_failed`,
  }),
  (req, res) => {
    const user = req.user as User;
    const token = generateToken(user);

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?token=${token}`);
  }
);

export default router;
