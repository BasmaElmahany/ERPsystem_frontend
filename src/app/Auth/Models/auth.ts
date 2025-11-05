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
