import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ name: 'isEndDateAfterStartDate', async: false })
export class IsEndDateAfterStartDate implements ValidatorConstraintInterface {
  validate(endDate: Date, args: ValidationArguments): boolean {
    const object = args.object as any;
    if (!object.startDate || !endDate) {
      return true; // Let @IsNotEmpty handle missing dates
    }
    return new Date(endDate) >= new Date(object.startDate);
  }

  defaultMessage(args: ValidationArguments): string {
    return 'End date must be greater than or equal to start date';
  }
}
