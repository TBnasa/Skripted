import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AppError } from './errors';
import { ZodError } from 'zod';

type RouteHandler = (req: NextRequest, context: { userId: string; params: any }) => Promise<Response>;

/**
 * Standardized API Route Handler Wrapper
 * Handles:
 * 1. Clerk Authentication
 * 2. Unified Error Formatting
 * 3. Zod Validation Error Mapping
 */
export function withAuth(handler: RouteHandler) {
  return async (req: NextRequest, { params }: { params: any }) => {
    try {
      const { userId } = await auth();
      if (!userId) {
        throw AppError.unauthorized();
      }

      return await handler(req, { userId, params });
    } catch (error: any) {
      return handleError(error);
    }
  };
}

/**
 * Public API Route Handler Wrapper (No Auth required)
 */
export function withPublic(handler: (req: NextRequest, context: { params: any }) => Promise<Response>) {
  return async (req: NextRequest, { params }: { params: any }) => {
    try {
      return await handler(req, { params });
    } catch (error: any) {
      return handleError(error);
    }
  };
}

function handleError(error: any) {
  console.error('[API Error]:', error);

  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message, code: error.code, details: error.details },
      { status: error.statusCode }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: 'Validation failed', code: 'VALIDATION_FAILED', details: error.errors },
      { status: 400 }
    );
  }

  // Fallback for unexpected errors
  return NextResponse.json(
    { error: 'Internal Server Error', code: 'INTERNAL_ERROR' },
    { status: 500 }
  );
}
