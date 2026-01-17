export const DATABASE_URL = process.env.DATABASE_URL;
export const PORT = Number(process.env.PORT);

export const UNISENDER_API_KEY = process.env.UNISENDER_API_KEY;
export const UNISENDER_LANG = process.env.UNISENDER_LANG;
export const UNISENDER_FROM_EMAIL = process.env.UNISENDER_FROM_EMAIL;
export const UNISENDER_FROM_NAME = process.env.UNISENDER_FROM_NAME;

export const ACCESS_SECRET_KEY = process.env.ACCESS_SECRET_KEY;
export const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY;

export const CLIENT_URL = process.env.CLIENT_URL;
export const NODE_ENV = process.env.NODE_ENV;

export const SMTP_HOST = process.env.SMTP_HOST;
export const SMTP_PORT = Number(process.env.SMTP_PORT);
export const SMTP_USER = process.env.SMTP_USER;
export const SMTP_PASSWORD = process.env.SMTP_PASSWORD;

export const DEFAULT_ADMIN_EMAIL = process.env.DEFAULT_ADMIN_EMAIL;
export const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD;

export const S3_URL = process.env.S3_URL;
export const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;
export const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY;
export const S3_SECRET_KEY = process.env.S3_SECRET_KEY;

export const RESEND_API_KEY: string = process.env.RESEND_API_KEY ?? '';
export const RESEND_FROM_EMAIL: string = process.env.RESEND_FROM_EMAIL ?? '';
