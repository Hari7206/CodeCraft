import nodemailer from "nodemailer";


const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        type: "OAuth2",
        user: process.env.EMAIL_USER,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN
    }
});


transporter.verify((error, success) => {
    if (error) {
        console.log(error); 
    } else {
        console.log("Server is ready to take messages");
    }
});


 export const sendEmail = async (to, subject, text , html) => {
    try{
        const info = await transporter.sendMail({
            from: `"Your Name <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html
        });
       console.log("message sent: %s", info.messageId);
       console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error(error);
    }
}