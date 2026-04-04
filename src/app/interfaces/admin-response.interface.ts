import { Recurso } from './recurso';
import { ApiResponse } from './api-response.interface';

export interface AdminResourcesPayload {
  resources: Recurso[];
  count: number;
  profileId?: number;
}

export interface AdminProfileResourcesPayload {
  profileId: number;
  selectedResourceIds: number[];
  updatedCount: number;
  message: string;
}

export interface AdminUserPayload {
  usuarioID: number;
  message: string;
  usuario: {
    ID: number;
    Login: string;
    Nombre: string;
    email: string;
    estado: number;
    libranza: number;
    idPersona: number;
  };
}

export interface AdminOperationPayload {
  operationId?: number;
  message: string;
  operation?: unknown;
  objeto?: unknown;
}

export type AdminResourcesResponse = ApiResponse<AdminResourcesPayload>;
export type AdminProfileResourcesResponse = ApiResponse<AdminProfileResourcesPayload>;
export type AdminUserResponse = ApiResponse<AdminUserPayload>;
export type AdminOperationResponse = ApiResponse<AdminOperationPayload>;
