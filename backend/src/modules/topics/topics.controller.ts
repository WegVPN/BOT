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
import { TopicsService } from './topics.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('topics')
@Controller('topics')
export class TopicsController {
  constructor(private topicsService: TopicsService) {}

  @Get('forum/:forumId')
  @ApiOperation({ summary: 'Get topics by forum' })
  async findByForum(
    @Param('forumId', ParseIntPipe) forumId: number,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ) {
    return this.topicsService.findByForum(forumId, page, limit, sortBy, sortOrder);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search topics' })
  async search(
    @Query('q') query: string,
    @Query('forumId', new ParseIntPipe({ optional: true })) forumId?: number,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.topicsService.search(query, forumId, page, limit);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active topics' })
  async getActiveTopics(@Query('limit', new ParseIntPipe({ optional: true })) limit?: number) {
    return this.topicsService.getActiveTopics(limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get topic with posts' })
  async findWithPosts(
    @Param('id', ParseIntPipe) id: number,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.topicsService.findWithPosts(id, page, limit);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new topic' })
  async create(@Request() req, @Body() createDto: CreateTopicDto) {
    return this.topicsService.create(req.user.id, createDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update topic (moderator+)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateTopicDto,
    @Request() req,
  ) {
    return this.topicsService.update(id, updateDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete topic (moderator+)' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.topicsService.delete(id);
  }

  @Post(':id/subscribe')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Subscribe to topic' })
  async subscribe(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.topicsService.subscribe(req.user.id, id);
  }

  @Post(':id/unsubscribe')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unsubscribe from topic' })
  async unsubscribe(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.topicsService.unsubscribe(req.user.id, id);
  }
}
