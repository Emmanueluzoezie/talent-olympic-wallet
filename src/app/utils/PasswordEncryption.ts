import * as crypto from 'crypto';

class EncryptPassword {
    private algorithm = 'aes-256-cbc';
    private ivLength = 16;

    encrypt(text: string, password: string): string {
        const key = Buffer.from(text, 'hex');
        const iv = crypto.randomBytes(this.ivLength);
        const cipher = crypto.createCipheriv(this.algorithm, key, iv);
        let encrypted = cipher.update(password, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return `${iv.toString('hex')}:${encrypted}`;
    }

    decrypt(text: string, password: string): string {
        const key = Buffer.from(text, 'hex');
        const [iv, encryptedText] = password.split(':');
        const decipher = crypto.createDecipheriv(this.algorithm, key, Buffer.from(iv, 'hex'));
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
}

export const encryptPassword = new EncryptPassword()