import crypto from 'crypto';


export const getRandomPassword = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@$/&';
    const randomValues = crypto.randomBytes(16);
    const password = Array.from(randomValues, c => (
        characters[c % characters.length]
    )).join('');

    return password;
}