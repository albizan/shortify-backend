import { Controller, Logger, Get, Param, Redirect } from '@nestjs/common';
import { LinkService } from './link.service';

@Controller('link')
export class LinkController {
  constructor(private linkService: LinkService) {
    this.logger = new Logger('LinkController');
  }
  private logger: Logger;

  @Get(':id')
  @Redirect('shorify.albertozanotti.it')
  async getOriginalLink(@Param() params) {
    // return this.linkService.getOriginalLink(params.id);
    const url = await this.linkService.getOriginalLink(params.id);
    return {
      statusCode: 301,
      url: url.original,
    };
  }
}
