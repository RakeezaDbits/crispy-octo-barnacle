import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import type { Customer } from '@shared/schema';

// Extend Express Request to include customer
declare global {
  namespace Express {
    interface Request {
      customer?: Customer;
    }
  }
}

// Middleware to authenticate customer requests
export const authenticateCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const customer = await AuthService.verifySession(token);
    
    if (!customer) {
      return res.status(401).json({ message: 'Invalid or expired session' });
    }

    req.customer = customer;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Authentication failed' });
  }
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuthentication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (token) {
      const customer = await AuthService.verifySession(token);
      if (customer) {
        req.customer = customer;
      }
    }

    next();
  } catch (error) {
    console.error('Optional authentication error:', error);
    next();
  }
};

// Get customer ID from request (for authenticated routes)
export const getCustomerId = (req: Request): string => {
  if (!req.customer) {
    throw new Error('Customer not authenticated');
  }
  return req.customer.id;
};