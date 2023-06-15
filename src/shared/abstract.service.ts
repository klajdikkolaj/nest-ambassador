import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/user';
import { Repository } from 'typeorm';

export abstract class AbstractService {
  protected constructor(
    @InjectRepository(User) private readonly repository: Repository<any>,
  ) {}

  async save(options) {
    return await this.repository.save(options);
  }

  async find(options = {}) {
    return await this.repository.find({ ...options });
  }

  async findOne(options) {
    return await this.repository.findOne({ where: options });
  }

  async update(id: number, options) {
    return this.repository.update(id, options);
  }

  async delete(id: number) {
    return this.repository.delete(id);
  }
}
