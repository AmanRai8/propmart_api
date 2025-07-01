import { Role } from "generated/prisma";
import { IsEmail, IsEnum, IsNotEmpty, IsString } from "class-validator";
export class RegisterDto {
    @IsEnum(Role)
    Role: Role;
    
    @IsString()
    @IsNotEmpty()
    userName: string;

    @IsString()
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}