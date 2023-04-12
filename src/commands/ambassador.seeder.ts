import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UserService } from '../user/user.service';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcryptjs';

(async () => {
  const app = await NestFactory.createApplicationContext(AppModule);
  const password = await bcrypt.hash('1234', 12);
  const userService = app.get(UserService);
  for (let i = 0; i < 30; i++) {
    await userService.save({
      first_name: faker.name.firstName(),
      last_name: faker.name.lastName(),
      email: faker.internet.email(),
      password,
      is_ambassador: true,
    });
  }
  process.exit();
})();
