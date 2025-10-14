import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRES_IN = '7d'; // Token expires in 7 days

// Register new user
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  async (req: Request, res: Response) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }

      // Create new user
      const user = new User({
        name,
        email,
        password // Will be hashed by the pre-save hook
      });

      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          preferredUnit: user.preferredUnit || 'km',
          mapStyle: user.mapStyle || 'streets-v12',
          defaultZoom: user.defaultZoom || 12,
          autoSaveRoutes: user.autoSaveRoutes !== undefined ? user.autoSaveRoutes : true,
          compactView: user.compactView || false,
          showRoutePreview: user.showRoutePreview !== undefined ? user.showRoutePreview : true,
          reduceAnimations: user.reduceAnimations || false,
          fontSize: user.fontSize || 'medium'
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Error registering user', error });
    }
  }
);

// Login user
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req: Request, res: Response) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          preferredUnit: user.preferredUnit || 'km',
          mapStyle: user.mapStyle || 'streets-v12',
          defaultZoom: user.defaultZoom || 12,
          autoSaveRoutes: user.autoSaveRoutes !== undefined ? user.autoSaveRoutes : true,
          compactView: user.compactView || false,
          showRoutePreview: user.showRoutePreview !== undefined ? user.showRoutePreview : true,
          reduceAnimations: user.reduceAnimations || false,
          fontSize: user.fontSize || 'medium'
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Error logging in', error });
    }
  }
);

// Get current user (verify token)
router.get('/me', async (req: Request, res: Response) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
});

// Update user preferences
router.patch('/preferences', async (req: Request, res: Response) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    const { 
      preferredUnit, 
      mapStyle, 
      defaultZoom, 
      autoSaveRoutes,
      compactView,
      showRoutePreview,
      reduceAnimations,
      fontSize
    } = req.body;

    // Build update object with only provided fields
    const updateFields: any = {};
    
    if (preferredUnit !== undefined) {
      if (!['km', 'mi'].includes(preferredUnit)) {
        return res.status(400).json({ message: 'Invalid unit. Must be "km" or "mi"' });
      }
      updateFields.preferredUnit = preferredUnit;
    }

    if (mapStyle !== undefined) {
      if (!['streets-v12', 'satellite-streets-v12', 'outdoors-v12', 'dark-v11'].includes(mapStyle)) {
        return res.status(400).json({ message: 'Invalid map style' });
      }
      updateFields.mapStyle = mapStyle;
    }

    if (defaultZoom !== undefined) {
      if (typeof defaultZoom !== 'number' || defaultZoom < 1 || defaultZoom > 20) {
        return res.status(400).json({ message: 'Default zoom must be between 1 and 20' });
      }
      updateFields.defaultZoom = defaultZoom;
    }

    if (autoSaveRoutes !== undefined) updateFields.autoSaveRoutes = autoSaveRoutes;
    if (compactView !== undefined) updateFields.compactView = compactView;
    if (showRoutePreview !== undefined) updateFields.showRoutePreview = showRoutePreview;
    if (reduceAnimations !== undefined) updateFields.reduceAnimations = reduceAnimations;
    
    if (fontSize !== undefined) {
      if (!['small', 'medium', 'large'].includes(fontSize)) {
        return res.status(400).json({ message: 'Font size must be "small", "medium", or "large"' });
      }
      updateFields.fontSize = fontSize;
    }

    const user = await User.findByIdAndUpdate(
      decoded.id,
      updateFields,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Preferences updated successfully',
      user
    });
  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
});

export default router;
