// ============================================
// PROFILE API ROUTE
// GET /api/auth/me
// ============================================
import type { NextApiRequest, NextApiResponse } from 'next';
import { AuthController } from '../../../src/controllers/AuthController';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
  }

  return AuthController.getProfile(req, res);
}
