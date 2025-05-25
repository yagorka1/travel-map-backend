import { IsEmail, IsString, MinLength, IsNotEmpty, Matches } from "class-validator"

export class RegisterDto {
  @IsEmail({}, { message: "Please provide a valid email address" })
  email!: string

  @IsString()
  @MinLength(6, { message: "Password must be at least 6 characters long" })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: "Password must contain at least one uppercase letter, one lowercase letter, and one number",
  })
  password!: string

  @IsString()
  @IsNotEmpty({ message: "First name is required" })
  firstName!: string

  @IsString()
  @IsNotEmpty({ message: "Last name is required" })
  lastName!: string
}
