const Joi = require("joi");

const RegisterSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  password_confirm :Joi.string().required(),
  tc: Joi.boolean().required(),
});
const LoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

module.exports = {
    RegisterSchema,
    LoginSchema,

  };