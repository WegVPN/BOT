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
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get post by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new post' })
  async create(@Request() req, @Body() createDto: CreatePostDto) {
    return this.postsService.create(req.user.id, createDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update post' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePostDto,
    @Request() req,
  ) {
    const isModerator = req.user.role?.name === 'moderator' || req.user.role?.name === 'admin';
    return this.postsService.update(id, req.user.id, updateDto, isModerator);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete post' })
  async delete(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const isModerator = req.user.role?.name === 'moderator' || req.user.role?.name === 'admin';
    return this.postsService.delete(id, req.user.id, isModerator);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Like a post' })
  async like(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.postsService.like(id, req.user.id);
  }

  @Post(':id/unlike')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unlike a post' })
  async unlike(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.postsService.unlike(id, req.user.id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get posts by user' })
  async findByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.postsService.getPostsByUser(userId, page, limit);
  }
}
