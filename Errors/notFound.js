class NotFoundError extends Error {
    constructor(message) {
      super(message);
      this.name = "NotFound Error";
      this.message = message;
      // this.stack = stack;
    }
  }
  
  module.exports = NotFoundError;
  