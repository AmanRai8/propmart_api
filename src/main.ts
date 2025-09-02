import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AuthGuard } from './guard/auth/auth.guard';
import { JwtService } from '@nestjs/jwt';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  app.useGlobalGuards(new AuthGuard(new JwtService(), new Reflector()));

  app.enableCors({
    origin: 'http://localhost:5173',
    Credentials: true,
  });
  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
