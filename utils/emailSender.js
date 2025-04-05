const nodemailer = require('nodemailer');
const mustache = require('mustache');
const fs = require('fs');
const path = require('path');

class EmailSender {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        this.templates = {
            verification: this.loadTemplate('verification.html'),
            passwordReset: this.loadTemplate('password_reset.html'),
            orderConfirmation: this.loadTemplate('order_confirm.html')
        };
    }

    loadTemplate(templateName) {
        const templatePath = path.join(__dirname, '../email_templates', templateName);
        return fs.readFileSync(templatePath, 'utf8');
    }

    async sendVerificationEmail(user, token) {
        const verificationLink = `${process.env.BASE_URL}/verify-email?token=${token}`;
        
        const mailOptions = {
            from: `"MarketPlace" <${process.env.EMAIL_FROM}>`,
            to: user.email,
            subject: 'Подтверждение email',
            html: mustache.render(this.templates.verification, {
                username: user.username,
                verificationLink,
                supportEmail: process.env.SUPPORT_EMAIL
            })
        };

        await this.sendMail(mailOptions);
    }

    async sendPasswordResetEmail(user, token) {
        const resetLink = `${process.env.BASE_URL}/reset-password?token=${token}`;

        const mailOptions = {
            from: `"MarketPlace" <${process.env.EMAIL_FROM}>`,
            to: user.email,
            subject: 'Сброс пароля',
            html: mustache.render(this.templates.passwordReset, {
                username: user.username,
                resetLink,
                expiryHours: process.env.RESET_TOKEN_EXPIRY || 24
            })
        };

        await this.sendMail(mailOptions);
    }

    async sendMail(mailOptions) {
        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log(`Email sent: ${info.messageId}`);
            return true;
        } catch (error) {
            console.error('Email sending error:', error);
            throw new Error('Failed to send email');
        }
    }
}

module.exports = new EmailSender();