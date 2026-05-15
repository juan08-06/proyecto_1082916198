export type UserRole = 'admin' | 'empleado';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  passwordHash: string;
  mustChangePassword?: boolean;
  active: boolean;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
}

export interface HomeData {
  hero: {
    title: string;
    subtitle: string;
    description: string;
    animationStyle: 'typewriter' | 'fadeIn' | 'slideUp';
  };
  meta: {
    pageTitle: string;
    description: string;
  };
}

export interface AppConfig {
  appName: string;
  version: string;
  locale: string;
  theme: 'light' | 'dark';
}
