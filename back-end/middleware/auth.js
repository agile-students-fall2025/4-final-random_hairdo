import jwt from 'jsonwebtoken'

/**
 * Authentication middleware to protect routes
 * Verifies JWT token from Authorization header
 */
export const authenticate = (req, res, next) => {
  try {
    // Get token from Authorization header (format: "Bearer <token>")
    const authHeader = req.header('Authorization')
    
    if (!authHeader) {
      return res.status(401).json({ 
        success: false,
        message: 'No token provided. Authorization denied.' 
      })
    }

    // Ensure "Bearer " prefix
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token format. Authorization denied.' 
      })
    }

    // Extract token
    const token = authHeader.split(' ')[1]
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Token missing. Authorization denied.' 
      })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Support both payload formats: { user: {...} } OR { id, email }
    req.user = decoded.user || { id: decoded.id, email: decoded.email }

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

/**
 * Generate JWT token for a user
 * @param {Object} user - User object with _id and email
 * @returns {String} JWT token
 */
export const generateToken = (user) => {
  const payload = {
    user: {
      id: user._id || user.id,
      email: user.email
    }
  }

  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  )
}

export default { authenticate, generateToken }
