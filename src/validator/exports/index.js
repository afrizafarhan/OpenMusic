const { ExportPayloadSchema } = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const ExportValidator = {
  validateExportPayload: (payload) => {
    const validateResult = ExportPayloadSchema.validate(payload);
    if (validateResult.error) {
      throw new InvariantError(validateResult.error.message);
    }
  },
};

module.exports = ExportValidator;
