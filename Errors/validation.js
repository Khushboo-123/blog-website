class ValidationError extends Error {
    constructor(message) {
      super(message);
      this.name = "Validation Error";
      this.message = message;
      // this.stack = stack;
    }
  }
  
  module.exports = ValidationError;
  