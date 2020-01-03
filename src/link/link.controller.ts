import { Controller, Logger, Get, Param } from '@nestjs/common';
import { LinkService } from './link.service';

@Controller('link')
export class LinkController {
  constructor(private linkService: LinkService) {
    this.logger = new Logger('LinkController');
  }
  private logger: Logger;

  @Get(':id')
  getOriginalLink(@Param() params) {
    return this.linkService.getOriginalLink(params.id);
  }
}
