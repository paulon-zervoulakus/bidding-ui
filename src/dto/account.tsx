export interface BasicProfileDTO{
    id:number,
    userName: string,
    email: string,
    fullName: string,
    dateOfBirth: string,
    role: RoleEnum,
    gender: GenderEnum,
}
enum RoleEnum {
    guest = 1,
    member = 2,
    administrator = 3,
    seller = 4
}
enum GenderEnum {
    hidden = 1,
    male = 2,
    female = 3
}
