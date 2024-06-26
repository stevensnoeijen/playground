import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { eq } from 'drizzle-orm';
import type { DrizzleService } from '../drizzle/drizzle.service';
import { UserTable } from '../drizzle/schema';
import type { CreateUserDto } from './dto/createUser.dto';
import type { UpdateUserDto } from './dto/updateUser.dto';
import type { UserQuery } from './dto/user.query';

@Controller('users')
export class UserController {
  constructor(private readonly drizzleService: DrizzleService) {}

  @Get()
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAll(@Query() { limit }: UserQuery) {
    const users = await this.drizzleService.db.query.UserTable.findMany({
      limit,
    });
    return users;
  }

  @Post()
  async createOne(@Body() body: CreateUserDto) {
    const user = await this.drizzleService.db
      .insert(UserTable)
      .values(body)
      .onConflictDoUpdate({
        target: UserTable.email,
        set: body,
      })
      .returning();
    return user;
  }

  @Put('/:id')
  async updateOne(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateUserDto,
  ) {
    const user = await this.drizzleService.db
      .update(UserTable)
      .set(body)
      .where(eq(UserTable.id, id))
      .returning();
    return user;
  }

  @Delete('/:id')
  @HttpCode(204)
  async deleteOne(@Param('id', ParseIntPipe) id: number) {
    await this.drizzleService.db
      .delete(UserTable)
      .where(eq(UserTable.id, id))
      .returning();
  }
}
