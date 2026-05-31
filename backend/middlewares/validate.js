

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

const validateBody = (requiredFields) => {
  return (req, res, next) => {
    const missingFields = [];
    
    
    requiredFields.forEach(field => {
      if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
        missingFields.push(field);
      }
    });

    if (missingFields.length > 0) {
      const msg = `Missing required field(s): ${missingFields.join(', ')}`;
      return res.status(400).json({
        success: false,
        message: msg,
        error: {
          message: msg,
          code: 'VALIDATION_ERROR',
          fields: missingFields
        }
      });
    }

    // Email format validation
    if (req.body.email && !validateEmail(req.body.email)) {
      // Allow empty email ONLY if anonymous submission
      if (req.originalUrl.includes('/tickets/submit') && req.body.isAnonymous) {
        // do nothing
      } else {
        const msg = 'Invalid email address format';
        return res.status(400).json({
          success: false,
          message: msg,
          error: {
            message: msg,
            code: 'VALIDATION_ERROR',
            fields: ['email']
          }
        });
      }
    }

    // Password length validation
    if (req.body.password && req.body.password.length < 6) {
      const msg = 'Password must be at least 6 characters long';
      return res.status(400).json({
        success: false,
        message: msg,
        error: {
          message: msg,
          code: 'VALIDATION_ERROR',
          fields: ['password']
        }
      });
    }

    next();
  };
};

module.exports = {
  validateBody
};
