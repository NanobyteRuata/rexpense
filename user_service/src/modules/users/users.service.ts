import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UpdateUserDto } from './dtos/requests/update-user.dto';
import { UserNotFoundException } from 'src/core/exceptions/user-exceptions';
import { ResponseFormat } from 'src/common/models/response-format.model';
import { IPaginationOptions } from 'nestjs-typeorm-paginate';
import { paginate } from 'nestjs-typeorm-paginate';
import { KafkaService } from 'src/kafka/kafka.service';
import { MessageTypes } from 'src/kafka/kafka.constants';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly kafkaService: KafkaService,
  ) {}

  async findAllUsers(
    options: IPaginationOptions,
    filters?: { isActive?: boolean },
  ): Promise<ResponseFormat> {
    const { items, meta } = await paginate<User>(this.userRepository, options, {
      where: filters,
    });
    return new ResponseFormat({
      status: 'success',
      message: 'Users fetched successfully',
      data: items,
      pagination: meta,
    });
  }

  async findUserById(id: number): Promise<ResponseFormat> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new UserNotFoundException(id);
    return new ResponseFormat({
      status: 'success',
      message: 'User fetched successfully',
      data: user,
    });
  }

  async updateUser(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<ResponseFormat> {
    const user = await this.findUserById(id);
    if (!user) {
      throw new UserNotFoundException(id);
    }

    await this.userRepository.update(id, {
      ...updateUserDto,
      updatedAt: new Date(),
    });

    const response = await this.findUserById(id);
    response.message = 'User updated successfully';

    // Emit user update event
    await this.kafkaService.emitMessage(
      MessageTypes.USER_UPDATED,
      response.data,
    );

    return response;
  }

  async deactivateUser(id: number): Promise<ResponseFormat> {
    const response = await this.updateUser(id, { isActive: false });
    response.message = 'User deactivated successfully';
    return response;
  }

  async deleteUser(id: number): Promise<ResponseFormat> {
    const { data } = await this.findUserById(id);
    if (!data) throw new UserNotFoundException(id);

    await this.userRepository.delete(id);

    // Emit user delete event
    await this.kafkaService.emitMessage(MessageTypes.USER_DELETED, data);

    return new ResponseFormat({
      status: 'success',
      message: 'User deleted successfully',
      data,
    });
  }
}
