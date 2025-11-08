import { PrismaClient, UserRole, AuthProvider } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: process.env.NODE_ENV === 'production'
    ? path.resolve(process.cwd(), '.env')
    : path.resolve(process.cwd(), '.env'),
});

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
      displayName: '系统管理员',
      role: UserRole.ADMIN,
      authProvider: AuthProvider.LOCAL,
      isActive: true,
    },
  });

  console.log(`✅ Admin user created/updated: ${adminUser.email}`);

  const siteUrl = process.env.SITE_URL || 'http://localhost:5000';
  
  const googleConfig = await prisma.oAuth2Config.upsert({
    where: { name: 'Google OAuth2' },
    update: {
      isActive: true,
    },
    create: {
      name: 'Google OAuth2',
      provider: 'GOOGLE',
      clientId: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
      callbackUrl: process.env.GOOGLE_CALLBACK_URL || `${siteUrl}/api/auth/oauth2/google/callback`,
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
      scope: ['profile', 'email'],
      isActive: true,
    },
  });

  console.log(`✅ Google OAuth2 config created/updated: ${googleConfig.name} (Active: ${googleConfig.isActive})`);

  const githubConfig = await prisma.oAuth2Config.upsert({
    where: { name: 'GitHub OAuth2' },
    update: {
      isActive: true,
    },
    create: {
      name: 'GitHub OAuth2',
      provider: 'GITHUB',
      clientId: process.env.GITHUB_CLIENT_ID || 'your-github-client-id',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || 'your-github-client-secret',
      callbackUrl: process.env.GITHUB_CALLBACK_URL || `${siteUrl}/api/auth/oauth2/github/callback`,
      authUrl: 'https://github.com/login/oauth/authorize',
      tokenUrl: 'https://github.com/login/oauth/access_token',
      userInfoUrl: 'https://api.github.com/user',
      scope: ['read:user', 'user:email'],
      isActive: true,
    },
  });

  console.log(`✅ GitHub OAuth2 config created/updated: ${githubConfig.name} (Active: ${githubConfig.isActive})`);

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
