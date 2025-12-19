import { api } from '@/lib/axios';

export const authService = {
  login: (payload: { email: string; password: string }) =>
    api.post('/auth/login', payload).then(res => res.data),

  signup: (payload: { name: string; email: string; password: string }) =>
    api.post('/auth/signup', payload).then(res => res.data),
};
