import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe());
    await app.listen(process.env.PORT ?? 3000);
  } catch (error) {
    console.error('Bootstrap error:', error);
    process.exit(1);
  }
}
bootstrap().catch((err) => {
  console.error('Unhandled bootstrap error:', err);
});
