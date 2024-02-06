const Joi = require('joi');

const name = Joi.string()
  .pattern(/^([a-z]|[A-Z])+$/)
  .min(3)
  .max(25)
  .lowercase();
const username = Joi.string()
  .min(3)
  .max(25)
  .pattern(/^([a-z]|[A-Z]|[0-9]|_)+$/)
  .lowercase();
const email = Joi.string().email().lowercase();
const password = Joi.string()
  .min(6)
  .pattern(new RegExp('^[a-zA-Z0-9~`! @#$%^&*()_+={[}]|-:;"\'<,>.?/]{6,30}$'));

const role = Joi.string().lowercase().valid('user', 'admin');

const authValidator = {
  //signing up data validator.
  signupSchema: Joi.object().keys({
    firstname: name.required(),
    lastname: name.required(),
    username: username.required(),
    email: email.required(),
    password: password.required(),
    role,
  }),

  //loging in data validator.
  loginSchema: Joi.object().keys({
    username: username.required(),
    password: password.required(),
  }),

  //forgot password validator
  forgotPasswordSchema: Joi.object().keys({
    email: email.required(),
  }),

  //reset password validator
  resetPasswordSchema: Joi.object().keys({
    newPassword: password.required(),
  }),
};

module.exports = authValidator;
