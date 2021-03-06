import { Field, ObjectType, ID } from '@nestjs/graphql';
import { ModuleType } from 'src/modules/dto/querys/module.type';

@ObjectType()
export class RoleType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => [ModuleType], { nullable: true })
  modules: ModuleType[];
}
