import CryptoJS from 'crypto-js';

export interface DESConfig {
  key: string;
  iv: string;
  mode?: string;
  padding?: string;
}

const resolveMode = (mode?: string) => {
  switch ((mode || 'CBC').toUpperCase()) {
    case 'ECB':
      return CryptoJS.mode.ECB;
    case 'CFB':
      return CryptoJS.mode.CFB;
    case 'OFB':
      return CryptoJS.mode.OFB;
    case 'CTR':
      return CryptoJS.mode.CTR;
    case 'CBC':
    default:
      return CryptoJS.mode.CBC;
  }
};

const resolvePadding = (padding?: string) => {
  const normalized = (padding || 'PKCS7').toLowerCase();
  switch (normalized) {
    case 'pkcs5':
    case 'pkcs5padding':
    case 'pkcs7':
    case 'pkcs7padding':
      return CryptoJS.pad.Pkcs7;
    case 'nopadding':
      return CryptoJS.pad.NoPadding;
    case 'zeropadding':
      return CryptoJS.pad.ZeroPadding;
    default:
      return CryptoJS.pad.Pkcs7;
  }
};

export class DESEncryption {
  private key: CryptoJS.lib.WordArray;
  private iv: CryptoJS.lib.WordArray;
  private mode: CryptoJS.Mode;
  private padding: CryptoJS.Padding;

  constructor(config: DESConfig) {
    if (!config.key || config.key.length !== 8) {
      throw new Error('DES key must be exactly 8 characters long');
    }
    if (!config.iv || config.iv.length !== 8) {
      throw new Error('DES IV must be exactly 8 characters long');
    }

    this.key = CryptoJS.enc.Utf8.parse(config.key);
    this.iv = CryptoJS.enc.Utf8.parse(config.iv);
    this.mode = resolveMode(config.mode);
    this.padding = resolvePadding(config.padding);
  }

  encrypt(plainText: string): string {
    const encrypted = CryptoJS.DES.encrypt(plainText, this.key, {
      iv: this.iv,
      mode: this.mode,
      padding: this.padding,
    });
    return encrypted.toString();
  }

  decrypt(cipherText: string): string {
    const decrypted = CryptoJS.DES.decrypt(cipherText, this.key, {
      iv: this.iv,
      mode: this.mode,
      padding: this.padding,
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
