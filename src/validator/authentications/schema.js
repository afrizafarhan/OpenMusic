const Joi = require('joi');

const PostAuthenticationsPayloadSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

const TokenAuthenticationSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

module.exports = {
  PostAuthenticationsPayloadSchema,
  TokenAuthenticationSchema,
};
