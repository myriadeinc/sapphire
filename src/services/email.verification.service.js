const MailerApi = require('src/api/mailer.api.js');

const logger = require('src/util/logger.js').account;
const AccountService = require('src/services/accounts.service.js');
const encryption = require('src/util/encryption.js');

const mailer = new MailerApi();

const EmailVerificationService = {

  verifyEmail: async (email) => {
    try {
      const exists = await AccountService.emailExists(email);
      if (exists) {
        return false;
      }

      const tok = await encryption.encrypt(email);
      // const url = `https://${config.get('service:host')}/v1/email/validate?token=${tok}`;
      await mailer.send(email, {
        subject: 'Confirm your email',
        text: `Token: ${tok}`,
        // text:`confirm your email by clicking this link ${url}`,
        // html: `<a href="${url}">Confirm Email</a>`
      });
      return true;
    } catch (err) {
      logger.error(err);
      return false;
    }
  },
};

module.exports = EmailVerificationService;
