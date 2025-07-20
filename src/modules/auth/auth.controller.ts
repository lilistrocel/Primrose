import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User, IUser } from './auth.model';
import { registerSchema, loginSchema } from './auth.validation';
import { createError } from '../../middleware/errorHandler';
import { Types } from 'mongoose';

// Generate JWT token
function generateToken(userId: string): string {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not defined');
  }
  
  return jwt.sign({ userId }, secret, { expiresIn } as SignOptions);
}

export class AuthController {
  // Register new user
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate request body
      const { error, value } = registerSchema.validate(req.body);
      if (error) {
        return next(createError(error.details[0]?.message || 'Validation error', 400));
      }

      const { email, password, firstName, lastName } = value;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return next(createError('User already exists with this email', 409));
      }

      // Create new user
      const user = new User({
        email,
        password,
        firstName,
        lastName
      });

      await user.save();

      // Generate token
      const token = generateToken((user._id as Types.ObjectId).toString());

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isEmailVerified: user.isEmailVerified
          },
          token
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Login user
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate request body
      const { error, value } = loginSchema.validate(req.body);
      if (error) {
        return next(createError(error.details[0]?.message || 'Validation error', 400));
      }

      const { email, password } = value;

      // Find user with password field
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return next(createError('Invalid email or password', 401));
      }

      // Check password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return next(createError('Invalid email or password', 401));
      }

      // Generate token
      const token = generateToken((user._id as Types.ObjectId).toString());

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isEmailVerified: user.isEmailVerified
          },
          token
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get current user profile
  static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      
      const user = await User.findById(userId);
      if (!user) {
        return next(createError('User not found', 404));
      }

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
} 