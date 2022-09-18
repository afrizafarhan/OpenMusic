const Joi = require('joi');

const PostAuthenticationsPayloadSchema = Joi.schema({
  username: Joi.string().min(6).max(20).required(),
  password: Joi.string().min(6).max(20).required(),
});

const TokenAuthenticationSchema = Joi.schema({
  refreshToken: Joi.string().required(),
});

module.exports = {
  PostAuthenticationsPayloadSchema,
  TokenAuthenticationSchema,
};
