import CryptoJS from 'crypto-js';

export interface DESConfig {
  key: string;
  iv: string;
  mode?: string;
  padding?: string;
}

export class DESEncryption {
  private key: any;
  private iv: any;

  constructor(config: DESConfig) {
    this.key = CryptoJS.enc.Utf8.parse(config.key);
    this.iv = CryptoJS.enc.Utf8.parse(config.iv);
  }

  encrypt(plainText: string): string {
    const encrypted = CryptoJS.DES.encrypt(plainText, this.key, {
      iv: this.iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return encrypted.toString();
  }

  decrypt(cipherText: string): string {
    const decrypted = CryptoJS.DES.decrypt(cipherText, this.key, {
      iv: this.iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  static createSSOPayload(userCode: string, pageUrl?: string): { UserCode: string; iat: number; PageUrl?: string } {
    return {
      UserCode: userCode,
      iat: Math.floor(Date.now() / 1000),
      PageUrl: pageUrl,
    };
  }

  static verifySSOTimestamp(timestamp: number, validityMinutes: number = 5): boolean {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const difference = Math.abs(currentTimestamp - timestamp);
    return difference <= validityMinutes * 60;
  }
}

export const encryptPassword = (password: string): string => {
  return CryptoJS.SHA256(password).toString();
};

export const comparePassword = (password: string, hashedPassword: string): boolean => {
  return encryptPassword(password) === hashedPassword;
};
