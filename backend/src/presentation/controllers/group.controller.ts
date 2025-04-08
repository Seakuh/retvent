import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { GroupService } from 'src/application/services/group.service';
import { CreateGroupDto } from '../dtos/create-group.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('groups')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req, @Body() dto: CreateGroupDto) {
    return this.groupService.createGroup(req.user.userId, dto);
  }
}
