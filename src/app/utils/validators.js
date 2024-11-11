/**
 * Validates the request body against defined rules
 * @param {Object} body - Request body to validate
 * @returns {Object} Validation result
 */
function validateRequestBody(body) {
  const errors = [];

  // Check if body is empty
  if (!body || Object.keys(body).length === 0) {
    errors.push('Request body cannot be empty');
    return {
      isValid: false,
      errors
    };
  }

  // Add specific validation rules here
  // Example: Check for required fields
  const requiredFields = ['test']; // Add your required fields
  for (const field of requiredFields) {
    if (!(field in body)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Example: Validate field types
  if (body.test && typeof body.test !== 'string') {
    errors.push('Field "test" must be a string');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateRequestBody
}; 