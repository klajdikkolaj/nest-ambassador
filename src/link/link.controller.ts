import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { LinkService } from './link.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller()
export class LinkController {
  constructor(private linkService: LinkService) {}

  @UseGuards(AuthGuard)
  @Get('admin/users/:id/links')
  async all(@Param('id') id: number) {
    return this.linkService.find({
      user: id,
      relations: ['orders'],
    });
  }
}
