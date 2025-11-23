// ============================================
// LOGOUT API ROUTE
// POST /api/auth/logout
// ============================================
import type { NextApiRequest, NextApiResponse } from 'next';
import { AuthController } from '../../../src/controllers/AuthController';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
  }

  return AuthController.logout(req, res);
}
