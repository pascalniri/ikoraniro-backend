import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SavedSearchesService } from './saved-searches.service';
import { CreateSavedSearchDto } from './dto/create-saved-search.dto';
import { UpdateSavedSearchDto } from './dto/update-saved-search.dto';

@Controller('saved-searches')
@UseGuards(JwtAuthGuard)
export class SavedSearchesController {
  constructor(private readonly savedSearchesService: SavedSearchesService) {}

  @Post()
  async create(
    @Req() req: { user: { userId: string } },
    @Body() dto: CreateSavedSearchDto,
  ) {
    return this.savedSearchesService.create(req.user.userId, dto);
  }

  @Get()
  async list(
    @Req() req: { user: { userId: string } },
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.savedSearchesService.findAllByUserId(req.user.userId, {
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  @Get(':id')
  async getOne(
    @Param('id') id: string,
    @Req() req: { user: { userId: string } },
  ) {
    return this.savedSearchesService.findOneForUser(id, req.user.userId);
  }

  @Get(':id/jobs')
  async runSearch(
    @Param('id') id: string,
    @Req() req: { user: { userId: string } },
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.savedSearchesService.runSearch(id, req.user.userId, {
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Req() req: { user: { userId: string } },
    @Body() dto: UpdateSavedSearchDto,
  ) {
    return this.savedSearchesService.update(id, req.user.userId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @Req() req: { user: { userId: string } },
  ) {
    await this.savedSearchesService.remove(id, req.user.userId);
  }
}
