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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ForumsService } from './forums.service';
import { CreateForumDto } from './dto/create-forum.dto';
import { UpdateForumDto } from './dto/update-forum.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('forums')
@Controller('forums')
export class ForumsController {
  constructor(private forumsService: ForumsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all forums' })
  async findAll() {
    return this.forumsService.findAll();
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Get forums by category' })
  async findByCategory(@Param('categoryId', ParseIntPipe) categoryId: number) {
    return this.forumsService.findByCategory(categoryId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get forum by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.forumsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new forum (admin only)' })
  async create(@Body() createDto: CreateForumDto) {
    return this.forumsService.create(createDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update forum (admin only)' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateForumDto) {
    return this.forumsService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete forum (admin only)' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.forumsService.delete(id);
  }
}
