import nodemailer from 'nodemailer';

export const sendEmail = async (to: string, subject: string, html: string) : Promise<void> => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.NODEMAILER_HOST,
            port: Number(process.env.NODEMAILER_PORT),
            secure: false,
            auth: {
                user: process.env.NODEMAILER_USER,
                pass: process.env.NODEMAILER_PASS
            }
        })
        const mailOptions = {
            from: `"TrustFarokht" <${process.env.NODEMAILER_USER}>`,
            to,
            subject,
            html
        }
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to} with subject: ${subject}`);
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send email");
    }
}