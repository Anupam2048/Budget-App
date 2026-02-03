import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

// Custom error class
export class AppError extends Error {
    statusCode: number;
    isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

// Global error handler
export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let statusCode = 500;
    let message = 'Internal server error';
    let details: any = undefined;

    // Handle custom AppError
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
    }

    // Handle Prisma errors
    else if (err instanceof Prisma.PrismaClientKnownRequestError) {
        statusCode = 400;

        // Unique constraint violation
        if (err.code === 'P2002') {
            const target = (err.meta?.target as string[]) || [];
            message = `A record with this ${target.join(', ')} already exists`;
        }
        // Record not found
        else if (err.code === 'P2025') {
            statusCode = 404;
            message = 'Record not found';
        }
        // Foreign key constraint failed
        else if (err.code === 'P2003') {
            message = 'Invalid reference to related record';
        }
        else {
            message = 'Database operation failed';
            details = { code: err.code };
        }
    }

    // Handle Prisma validation errors
    else if (err instanceof Prisma.PrismaClientValidationError) {
        statusCode = 400;
        message = 'Invalid data provided';
        // Extract useful error info
        const errorMsg = err.message;
        if (errorMsg.includes('Argument')) {
            const argMatch = errorMsg.match(/Argument `(\w+)` is missing/);
            if (argMatch) {
                message = `Missing required field: ${argMatch[1]}`;
            }
        }
    }

    // Handle JWT errors
    else if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid authentication token';
    }
    else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Authentication token expired';
    }

    // Handle validation errors (like from express-validator)
    else if (err.name === 'ValidationError') {
        statusCode = 400;
        message = err.message;
    }

    // Log error for debugging (only in development)
    if (process.env.NODE_ENV !== 'production') {
        console.error('Error:', {
            name: err.name,
            message: err.message,
            stack: err.stack,
            statusCode
        });
    } else {
        // In production, only log operational errors
        if ((err as AppError).isOperational !== false) {
            console.error('Operational Error:', {
                statusCode,
                message,
                path: req.path,
                method: req.method
            });
        } else {
            // Log unknown errors with full details
            console.error('Unknown Error:', {
                error: err,
                stack: err.stack
            });
        }
    }

    // Send error response
    res.status(statusCode).json({
        success: false,
        message,
        ...(details && { details }),
        ...(process.env.NODE_ENV !== 'production' && {
            stack: err.stack,
            error: err.message
        })
    });
};

// Async error wrapper - wraps async route handlers
export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// 404 handler - for routes that don't exist
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
    const error = new AppError(`Route ${req.originalUrl} not found`, 404);
    next(error);
};
