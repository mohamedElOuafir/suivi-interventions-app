import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    service : "gmail",
    auth : {
        user : process.env.ADMIN_EMAIL,
        pass : process.env.PASSWORD_APP
    }
});


export const sendPasswordViaMail = async (user, password) => {

    try {
        await transporter.sendMail({
            from : process.env.ADMIN_EMAIL,
            to : user.email,
            subject : 'Your Account Has Been Created - Initial Login Details Inside',
            text : `Hello ${user.prenom},

                    Your account has been successfully created on our monitoring of IT equipment intervnetions.

                    🔐 Here are your login credentials:
                    - Email: ${user.email}
                    - Temporary Password: ${password}

                    For security reasons, please log in as soon as possible and change your password.

                    If you have any questions or need assistance, feel free to contact support.

                    Best regards,`
        });
        return true;
    } catch (error) {
        return false;
    }   
}