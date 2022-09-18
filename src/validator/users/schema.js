const Joi = require('joi');

const usersPayloadSchema = Joi.schema({
  username: Joi.string().min(6).max(20).required(),
  password: Joi.string().min(6).max(20).required(),
  fullname: Joi.string().required(),
});

module.exports = { usersPayloadSchema };
