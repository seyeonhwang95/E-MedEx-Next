import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';

import { Public } from '../auth/public.decorator.js';

@Controller('health')
export class HealthController {
  @Get()
  @Public()
  health(@Req() request: Request) {
    return {
      status: 'ok',
      service: 'api',
      tenant: request.headers['x-tenant-id'] ?? null,
      timestamp: new Date().toISOString(),
    };
  }
}