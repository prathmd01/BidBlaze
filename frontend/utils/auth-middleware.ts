
import type { NextApiRequest } from 'next'
import jwt from 'jsonwebtoken'

interface DecodedToken {
  userId: string
  email: string
  role: 'buyer' | 'seller' | 'admin'
}

export async function authMiddleware(req: NextApiRequest): Promise<DecodedToken | null> {
  try {
    const token = req.cookies['auth-token'] || req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return null
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken
    return decoded
  } catch (error) {
    return null
  }
}

export function requireAuth(roles: string[] = []) {
  return async (req: NextApiRequest, res: { status: (code: number) => { json: (body: { message: string }) => void } }, next: () => void) => {
    const user = await authMiddleware(req)

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    if (roles.length > 0 && !roles.includes(user.role)) {
      return res.status(403).json({ message: 'Forbidden' })
    }

    ; (req as NextApiRequest & { user: DecodedToken }).user = user
    next()
  }
}
