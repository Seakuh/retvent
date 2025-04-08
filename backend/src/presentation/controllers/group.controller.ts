import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { GroupService } from 'src/application/services/group.service';
import { CreateGroupDto } from '../dtos/create-group.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('groups')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req, @Body() dto: CreateGroupDto) {
    return this.groupService.createGroup(req.user.id, dto);
  }

  @Post('/join/:token')
  @UseGuards(JwtAuthGuard)
  joinGroup(@Req() req, @Param('token') token: string) {
    return this.groupService.joinGroup(req.user.id, token);
  }

  @Post('/leave/:groupId')
  @UseGuards(JwtAuthGuard)
  leaveGroup(@Req() req, @Param('groupId') groupId: string) {
    return this.groupService.leaveGroup(req.user.id, groupId);
  }

  @Get('/:groupId')
  @UseGuards(JwtAuthGuard)
  getGroup(@Req() req, @Param('groupId') groupId: string) {
    return this.groupService.getGroupById(groupId);
  }

  //   @Put('/:groupId')
  //   @UseGuards(JwtAuthGuard)
  //   updateGroup(
  //     @Req() req,
  //     @Param('groupId') groupId: string,
  //     @Body() dto: UpdateGroupDto,
  //   ) {
  //     return this.groupService.updateGroup(groupId, dto);
  //   }
}
