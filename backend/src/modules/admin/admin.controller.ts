import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Permission } from '../../entities/role.entity';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getDashboard() {
    return this.adminService.getDashboardStats();
  }

  // User management
  @Get('users')
  @ApiOperation({ summary: 'Get all users (admin)' })
  async getAllUsers(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.adminService.getAllUsers(page, limit);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user by ID (admin)' })
  async getUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.getUserById(id);
  }

  @Post('users/:id/ban')
  @ApiOperation({ summary: 'Ban user (admin/moderator)' })
  async banUser(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Body('reason') reason?: string,
  ) {
    return this.adminService.banUser(id, req.user.id, reason);
  }

  @Post('users/:id/unban')
  @ApiOperation({ summary: 'Unban user (admin/moderator)' })
  async unbanUser(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.adminService.unbanUser(id, req.user.id);
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Change user role (admin)' })
  async changeUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body('role_id') roleId: number,
    @Request() req,
  ) {
    return this.adminService.changeUserRole(id, roleId, req.user.id);
  }

  // Role management
  @Get('roles')
  @ApiOperation({ summary: 'Get all roles (admin)' })
  async getAllRoles() {
    return this.adminService.getAllRoles();
  }

  @Post('roles')
  @ApiOperation({ summary: 'Create new role (admin)' })
  async createRole(
    @Body('name') name: string,
    @Body('permissions') permissions: Permission[],
  ) {
    return this.adminService.createRole(name, permissions);
  }

  // Forum management
  @Get('forums')
  @ApiOperation({ summary: 'Get all forums (admin)' })
  async getAllForums() {
    return this.adminService.getAllForums();
  }

  // Moderation logs
  @Get('logs')
  @ApiOperation({ summary: 'Get moderation logs (admin)' })
  async getModerationLogs(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.adminService.getModerationLogs(page, limit);
  }

  // Topic moderation
  @Post('topics/:id/close')
  @ApiOperation({ summary: 'Close topic (moderator+)' })
  async closeTopic(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.adminService.closeTopic(id, req.user.id);
  }

  @Post('topics/:id/open')
  @ApiOperation({ summary: 'Open topic (moderator+)' })
  async openTopic(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.adminService.openTopic(id, req.user.id);
  }

  @Post('topics/:id/pin')
  @ApiOperation({ summary: 'Pin topic (moderator+)' })
  async pinTopic(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.adminService.pinTopic(id, req.user.id);
  }

  @Post('topics/:id/unpin')
  @ApiOperation({ summary: 'Unpin topic (moderator+)' })
  async unpinTopic(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.adminService.unpinTopic(id, req.user.id);
  }

  @Post('topics/:id/move')
  @ApiOperation({ summary: 'Move topic to another forum (moderator+)' })
  async moveTopic(
    @Param('id', ParseIntPipe) id: number,
    @Body('forum_id') forumId: number,
    @Request() req,
  ) {
    return this.adminService.moveTopic(id, forumId, req.user.id);
  }
}
