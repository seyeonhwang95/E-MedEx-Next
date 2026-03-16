import { SetMetadata } from '@nestjs/common';

import type { Role } from './roles.js';

export const ROLES_METADATA_KEY = 'roles';

export const Roles = (...requiredRoles: Role[]) => SetMetadata(ROLES_METADATA_KEY, requiredRoles);