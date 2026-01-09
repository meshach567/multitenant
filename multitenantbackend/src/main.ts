import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    app.enableCors({
      origin: 'http://localhost:3000',
      credentials: true,
    });
    await app.listen(process.env.PORT ?? 3001);
  } catch (error) {
    console.error('Bootstrap error:', error);
    process.exit(1);
  }
}
bootstrap().catch((err) => {
  console.error('Unhandled bootstrap error:', err);
});
