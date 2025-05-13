import { PrismaClient, Role, Category, City } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // --- Seed Cities ---
  const cityData: Omit<City, 'id'>[] = [
    { name: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
    { name: 'Delhi', state: 'Delhi', pincode: '110001' },
    { name: 'Bangalore', state: 'Karnataka', pincode: '560001' },
    { name: 'Pune', state: 'Maharashtra', pincode: '411001' },
  ];
  console.log('\nSeeding Cities...');
  for (const c of cityData) {
    const existingCity = await prisma.city.findFirst({
      where: { name: c.name, state: c.state },
    });
    if (!existingCity) {
      const city = await prisma.city.create({
        data: c,
      });
      console.log(`Created city with id: ${city.id} (${city.name})`);
    } else {
      console.log(`City already exists: ${existingCity.name}, ${existingCity.state}`);
    }
  }

  // --- Seed Categories ---
  const categoryData: Omit<Category, 'id' | 'isActive' | 'iconUrl'>[] = [
    { name: 'Catering' },
    { name: 'Photography' },
    { name: 'Venue' },
    { name: 'Decoration' },
    { name: 'Music/DJ' },
    { name: 'Invitations' },
  ];
  console.log('\nSeeding Categories...');
  for (const cat of categoryData) {
    const category = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: { ...cat, iconUrl: `${cat.name.toLowerCase()}-icon.png` }, // Add placeholder icon
    });
    console.log(`Created/Updated category with id: ${category.id} (${category.name})`);
  }

  // --- Seed Admin User ---
  console.log('\nSeeding Admin User...');
  const adminEmail = 'admin@anvaya.app';
  const adminPassword = 'AdminPassword123'; // Use a strong password, ideally from env
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
      role: Role.admin,
      isActive: true,
      // No profile needed for admin
    },
  });
  console.log(`Created/Updated admin user with id: ${adminUser.id} (${adminUser.email})`);

  // --- Seed Sample Vendor and Listing ---
  console.log('\nSeeding Sample Vendor and Listing...');
  const sampleVendorEmail = 'samplevendor@example.com';
  const sampleVendorPassword = 'VendorPassword123';
  const vendorHashedPassword = await bcrypt.hash(sampleVendorPassword, saltRounds);

  // Get seeded city and category for vendor profile and listing
  const sampleCity = await prisma.city.findFirst({ where: { name: 'Pune' } });
  const sampleCategory = await prisma.category.findFirst({ where: { name: 'Photography' } });

  if (sampleCity && sampleCategory) {
    // Create Vendor User
    const vendorUser = await prisma.user.upsert({
      where: { email: sampleVendorEmail },
      update: {},
      create: {
        email: sampleVendorEmail,
        password: vendorHashedPassword,
        role: Role.vendor,
        isActive: true,
      },
    });
    console.log(`Created/Updated vendor user with id: ${vendorUser.id}`);

    // Create Vendor Profile
    const vendorProfile = await prisma.vendorProfile.upsert({
      where: { userId: vendorUser.id },
      update: {},
      create: {
        userId: vendorUser.id,
        name: 'Sample Photography Studio',
        bio: 'Capturing moments that matter.',
        cityId: sampleCity.id,
        categoryId: sampleCategory.id,
        tags: ['wedding', 'portrait', 'event'],
        isVerified: true, // Seed as verified for testing?
        ratingAverage: 4.5,
      },
    });
    console.log(`Created/Updated vendor profile with id: ${vendorProfile.id}`);

    // Create Sample Listing
    const sampleListing = await prisma.listing.create({
      data: {
        vendorId: vendorProfile.id,
        title: 'Full Day Wedding Photography Package',
        description: 'Complete wedding coverage from start to finish. Includes pre-wedding shoot.',
        priceMin: 50000,
        priceMax: 80000,
        categoryId: sampleCategory.id,
        location: 'Pune Area',
        images: { urls: ['image1.jpg', 'image2.jpg'] }, // Example JSON structure
      },
    });
    console.log(`Created sample listing with id: ${sampleListing.id}`);
  } else {
    console.log('Skipping vendor/listing seed: Could not find required city or category.');
  }

  console.log(`\nSeeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
