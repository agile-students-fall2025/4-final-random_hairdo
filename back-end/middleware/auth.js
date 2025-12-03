import jwt from 'jsonwebtoken'

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization')
    if (!authHeader) {
      return res.status(401).json({ 
        success: false,
        message: 'No token provided. Authorization denied.' 
      })
    }

    const token = authHeader.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token format. Authorization denied.' 
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // ✅ Read either decoded.user or top-level decoded
    req.user = {
      id: decoded.user?.id || decoded.id,
      email: decoded.user?.email || decoded.email
    }

    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token expired. Please login again.' 
      })
    }
    
    res.status(401).json({ 
      success: false,
      message: 'Invalid token. Authorization denied.' 
    })
  }
}

export const generateToken = (user) => {
  const payload = {
    user: {
      id: user._id || user.id,
      email: user.email
    }
  }

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' })
}

export default { authenticate, generateToken }
