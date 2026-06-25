import { Injectable, CanActivate, ExecutionContext, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleType } from '../../modules/user/domain/role.vo';

export const Roles = (...roles: RoleType[]) => SetMetadata('roles', roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<RoleType[]>('roles', context.getHandler());
    if (!roles || roles.length === 0) return true;

    const user = context.switchToHttp().getRequest().user;
    return !!user && roles.includes(user.role);
  }
}
