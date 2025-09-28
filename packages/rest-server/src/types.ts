export type User = {
  id: number;
  isSuper: boolean;
  email: string;
  permissions: string[];
  passwordHash?: string;
  suspended: boolean;
  createdAt: number;
  updatedAt: number;
};

export type Session = {
  id: number;
  userId: number;
  token: string;
  createdAt: number;
};

export type Permission = {};

export type ResponseList<T> = {
  isOK: boolean;
  message: string | null;
  data: {
    list: T[];
    total: number;
  };
};

export type ResponseObj<T> = {
  isOK: boolean;
  message: string | null;
  data: {
    obj: T;
  };
};

export type ResponseFail = {
  isOK: boolean;
  message: string;
  data: any;
};
