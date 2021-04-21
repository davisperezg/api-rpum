import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, Length, IsEmail, Matches } from 'class-validator';
import { IsMatchPassword } from 'src/lib/decorators/match.decorator';
import { RoleInput } from 'src/role/dto/inputs/role.input';
import { RoleType } from 'src/role/dto/querys/role.type';
import { RoleEntity } from 'src/role/entities/role.entity';
import { ObjectID } from 'typeorm';

@InputType()
export class UserInput {
  @Field()
  @Matches(/^[A-Za-z\s]+$/, { message: 'El nombre solo puede contener letras' })
  @IsNotEmpty()
  @Length(3, 55)
  name: string;

  @Field()
  @Matches(/^[A-Za-z\s]+$/, {
    message: 'El apellido solo puede contener letras',
  })
  @IsNotEmpty()
  @Length(3, 55)
  lastName: string;

  @Field()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Field()
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'La contraseña debe contener por lo menos una mayúscula y números',
  })
  @IsNotEmpty()
  @Length(6, 55)
  password: string;

  @Field()
  @IsMatchPassword('password', {
    message:
      'La confirmación de contraseña no coincide con la contraseña ingresada',
  })
  @IsNotEmpty()
  @Length(6, 55)
  confirmPassword: string;

  @Field(() => String)
  role: RoleInput;
}
