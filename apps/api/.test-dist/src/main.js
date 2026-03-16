import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors({
        origin: [/localhost$/, /127\.0\.0\.1$/],
        credentials: true,
    });
    app.useGlobalPipes(new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
    }));
    // Set up Swagger
    const config = new DocumentBuilder()
        .setTitle('E-MedEx API')
        .setDescription('Multi-tenant Medical Examiner Platform API')
        .setVersion('1.0.0')
        .addBearerAuth()
        .addTag('offline-grants', 'Device offline authentication grant lifecycle')
        .addTag('control-plane', 'Control plane operations')
        .addTag('cases', 'Case management')
        .addTag('labs', 'Lab operations')
        .addTag('evidence', 'Evidence tracking')
        .addTag('health', 'Service health')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    console.log(`API running on http://localhost:${port}`);
    console.log(`Swagger UI available at http://localhost:${port}/api/docs`);
}
bootstrap();
