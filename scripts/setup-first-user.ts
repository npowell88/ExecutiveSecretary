/**
 * Setup script for creating the first user (Executive Secretary)
 *
 * Usage: npx tsx scripts/setup-first-user.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Executive Secretary - Initial Setup\n');

  // Prompt for input
  const wardName = process.argv[2] || 'My Ward';
  const stakeName = process.argv[3] || 'My Stake';
  const email = process.argv[4];

  if (!email) {
    console.error('❌ Error: Email is required');
    console.log('\nUsage: npx tsx scripts/setup-first-user.ts "Ward Name" "Stake Name" "your-email@example.com"');
    process.exit(1);
  }

  console.log('Creating ward:', wardName);
  console.log('Stake:', stakeName);
  console.log('Executive Secretary email:', email);
  console.log('');

  // Create ward
  const ward = await prisma.ward.create({
    data: {
      name: wardName,
      stake: stakeName,
    },
  });

  console.log('✅ Ward created with ID:', ward.id);

  // Create executive secretary user
  const user = await prisma.user.create({
    data: {
      email,
      role: 'EXECUTIVE_SECRETARY',
      wardId: ward.id,
    },
  });

  console.log('✅ Executive Secretary user created with ID:', user.id);

  // Create some default interview types
  const interviewTypes = [
    { name: 'Temple Recommend Interview', description: 'Temple recommend interview', duration: 30 },
    { name: 'Youth Interview', description: 'Annual youth interview', duration: 20 },
    { name: 'Calling Extension', description: 'Calling extension or new calling', duration: 15 },
    { name: 'General Interview', description: 'General pastoral interview', duration: 30 },
  ];

  for (const type of interviewTypes) {
    await prisma.interviewType.create({
      data: {
        ...type,
        wardId: ward.id,
      },
    });
    console.log('✅ Created interview type:', type.name);
  }

  console.log('\n🎉 Setup complete!');
  console.log('\nNext steps:');
  console.log('1. Copy .env.example to .env and fill in your credentials');
  console.log('2. Run: npx prisma db push (to sync database)');
  console.log('3. Run: npm run dev');
  console.log('4. Go to http://localhost:3000/auth/signin');
  console.log('5. Sign in with:', email);
  console.log('\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
