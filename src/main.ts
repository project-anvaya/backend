import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PrismaClient } from '@prisma/client';

async function bootstrap() {
  // Prisma connection test
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    console.log("✅ Successfully connected to the database");
    await prisma.$disconnect();
  } catch (error) {
    console.error("❌ Failed to connect to the database", error);
    // Optionally, you might want to exit the process if DB connection fails
    // process.exit(1);
  }

  const app = await NestFactory.create(AppModule);

  // Global Pipes
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));

  // Swagger (OpenAPI) Setup
  const config = new DocumentBuilder()
    .setTitle('Anvaya API')
    .setDescription('API for Project Anvaya')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT || 3000, "0.0.0.0");
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
