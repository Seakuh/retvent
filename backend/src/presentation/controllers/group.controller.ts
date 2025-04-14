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
import { GroupGuard } from '../guards/group.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
@Controller('groups')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  @UseGuards(GroupGuard)
  create(@Req() req, @Body() dto: CreateGroupDto) {
    return this.groupService.createGroup(req.user.id, dto);
  }

  @Get('my-groups')
  @UseGuards(GroupGuard)
  async getMyGroups(@Req() req) {
    const userId = req.user.id;
    return this.groupService.getGroupsByUserId(userId);
  }

  @Post()
  @UseGuards(GroupGuard)
  createWithEvent(@Req() req, @Body() dto: CreateGroupDto) {
    return this.groupService.createGroupWithEvent(req.user.id, dto);
  }

  @Post('/create-or-join')
  createOrJoinGroup(@Body() dto: CreateGroupDto) {
    return this.groupService.createOrJoinGroup(null, dto);
  }

  @Post('/:groupId/members')
  @UseGuards(GroupGuard)
  addMemberToGroup(@Req() req, @Param('groupId') groupId: string) {
    return this.groupService.addMemberToGroup(groupId, req.user.id);
  }

  @Post('/join/:token')
  @UseGuards(GroupGuard)
  joinGroup(@Req() req, @Param('token') token: string) {
    return this.groupService.joinGroup(req.user.id, token);
  }

  @Post('/leave/:groupId')
  @UseGuards(GroupGuard)
  leaveGroup(@Req() req, @Param('groupId') groupId: string) {
    return this.groupService.leaveGroup(req.user.id, groupId);
  }

  @Get('/:groupId')
  @UseGuards(JwtAuthGuard)
  getGroup(@Req() req, @Param('groupId') groupId: string) {
    return this.groupService.getGroupById(groupId);
  }

  @Get('items/:groupId/')
  @UseGuards(JwtAuthGuard)
  getGroupWithLatestMessage(@Req() req, @Param('groupId') groupId: string) {
    return this.groupService.getGroupWithLatestMessage(req.user.id, groupId);
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
