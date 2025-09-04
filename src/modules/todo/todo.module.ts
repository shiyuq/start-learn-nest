import { Module } from '@nestjs/common';
import { Todo } from './entities/todo.entity';
import { TodoController } from './controllers/todo.controller';
import { TodoService } from './services/todo.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Todo])],
  controllers: [TodoController],
  providers: [TodoService],
})
export class TodoModule {}
