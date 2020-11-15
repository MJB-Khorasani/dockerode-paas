const ADMIN_MAIL = process.env.ADMIN_MAIL;

module.exports = (logger, mail) => {
    process.on('unhandledRejection', error => {
        mail.sendMail(ADMIN_MAIL, ADMIN_MAIL, "un handled promise rejection error", "html content");
        logger.error(error.messages, {
            meta: error
        });
    });
    process.on('uncaughtException', error => {
        mail.sendMail(ADMIN_MAIL, ADMIN_MAIL, "un handled promise rejection error", "html content");
        logger.error(error.messages, {
            meta: error
        });
    });
};