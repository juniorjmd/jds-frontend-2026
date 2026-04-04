import { Usuario, UsuarioLogeado } from './usuario.interface';

export interface AuthLoginData {
  _result: string;
  usuario: Usuario;
}

export interface AuthSessionData {
  usuario: Usuario;
}

export interface AuthCurrentUserData {
  usuario: UsuarioLogeado;
}

export interface AuthPasswordResetData {
  usuarioID?: number | null;
  mail?: string | null;
}

export interface AuthPasswordUpdateData {
  usuarioID: number;
}
