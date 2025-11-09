export const sanitizeOAuth2Config = (config: any) => {
  const { clientSecret, ...rest } = config;
  return {
    ...rest,
    clientSecret: clientSecret ? '***' + clientSecret.slice(-4) : undefined,
  };
};

export const sanitizeSSOConfig = (config: any) => {
  const { desKey, desIV, ...rest } = config;
  return {
    ...rest,
    desKey: desKey ? '***' + desKey.slice(-2) : undefined,
    desIV: desIV ? '***' + desIV.slice(-2) : undefined,
  };
};

export const sanitizeUser = (user: any) => {
  const { password, ...rest } = user;
  return rest;
};

export const maskSensitiveData = (data: string, visibleChars: number = 4): string => {
  if (!data || data.length <= visibleChars) {
    return '***';
  }
  return '***' + data.slice(-visibleChars);
};
