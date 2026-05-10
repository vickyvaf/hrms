import { Role, JabatanType, DepartemenType, JenisPegawai, StatusKawin, GenderType, ModulLog, AksiLog, StatusVerifikasi, Verifikator, StatusKehadiran, LokasiGedung } from '@prisma/client';

export interface UserSession {
  id: string;
  username: string;
  email: string;
  role: Role;
  pegawaiId: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta;
}

// Add more types as needed during development
