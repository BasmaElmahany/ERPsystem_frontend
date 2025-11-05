export interface Userlogin {
    email: string;
    password: string;
}

  export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  [key: string]: any;
  exp: number;
}
  export interface RegisterUserDto {
    fullName: string;
    email: string;
    password: string;
    projectId: number;
  }
