
const ValidationError = require('../Errors/validation')

const validate = (schema, data) => {
    const { error, value } = schema.validate(data);
   
    const valid = error == null;
    if (!valid) {
      const { details } = error;
      const message = details.map((i) => i.message).join(",");
      throw new ValidationError(message);
    }
    if (value) return value;
    throw new ValidationError("data not passed");
  };

  module.exports = {
    validate,
    
  };
  