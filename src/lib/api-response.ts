import { NextResponse } from 'next/server';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

export const successResponse = (message: string, data?: any, meta?: any) => {
  return NextResponse.json({
    success: true,
    message,
    data,
    meta,
  });
};

export const errorResponse = (message: string, status: number = 400) => {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status }
  );
};
