/// <reference types="@cloudflare/workers-types" />

declare module 'jsonwebtoken' {
  export function sign(payload: any, secret: string, options?: any): string;
  export function verify(token: string, secret: string): any;
}

interface Category {
  id: string;
  name: string;
}

interface Site {
  id: string;
  name: string;
  url: string;
  description?: string;
  categoryId: string;
}

interface Bookmark {
  name: string;
  url: string;
  description?: string;
}

interface Env {
  NAVIGATION_KV: KVNamespace;
  JWT_SECRET: string;
  ENVIRONMENT: string;
} 