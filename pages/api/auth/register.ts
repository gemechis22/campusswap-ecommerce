// ============================================
// REGISTER API ROUTE
// POST /api/auth/register
// ============================================
import type { NextApiRequest, NextApiResponse } from 'next';
import { AuthController } from '../../../src/controllers/AuthController';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Allow only POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: `Method ${req.method} not allowed` });
  }

  // Delegate to controller
  return AuthController.register(req, res);
}
