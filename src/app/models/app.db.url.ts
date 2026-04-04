import { HttpHeaders } from '@angular/common/http';

export interface AppDbEndpoints {
  action: string;
  actionDocumentos: string;
  actionAdmin: string;
  actionVentas: string;
  brand: string;
  datosIniciales: string;
  login: string;
  inventario: string;
  csv_manager: string;
  httpOptionsSinAutorizacion: {
    headers: {
      'Content-type': string;
    };
  };
}

const buildAuthHeaders = (includeContentType: boolean) => {
  const token = localStorage.getItem('sis41254#2@') ?? '';
  const headers: Record<string, string> = {};

  if (includeContentType) {
    headers['Content-type'] = 'application/json';
  }

  if (token !== '') {
    headers['Authorization'] = 'Bearer ' + token;
    headers['X-Session-Token'] = token;
  }

  return new HttpHeaders(headers);
};

export const httpOptions = () => ({
  headers: buildAuthHeaders(true),
});

export const httpFileOptions = () => ({
  headers: buildAuthHeaders(false),
});

export let url: AppDbEndpoints = {
  httpOptionsSinAutorizacion: {
    headers: { 'Content-type': 'application/json' },
  },
  action: '',
  actionDocumentos: '',
  actionAdmin: '',
  actionVentas: '',
  brand: '',
  datosIniciales: '',
  login: '',
  inventario: '',
  csv_manager: '',
};
export let printer: any = {};
export let enviroment = '';

export function syncAppDbRuntime(config: any): void {
  const baseURL = config?.baseURL ?? '';
  const endpoints = config?.endpoints ?? {};

  url = {
    httpOptionsSinAutorizacion: {
      headers: { 'Content-type': 'application/json' },
    },
    action: baseURL + (endpoints.action ?? ''),
    actionDocumentos: baseURL + (endpoints.actionDocumentos ?? ''),
    actionAdmin: baseURL + (endpoints.admin ?? ''),
    actionVentas: baseURL + (endpoints.actionVentas ?? ''),
    brand: baseURL + (endpoints.brand ?? ''),
    datosIniciales: baseURL + (endpoints.datosIniciales ?? ''),
    login: baseURL + (endpoints.login ?? ''),
    inventario: baseURL + (endpoints.inventario ?? ''),
    csv_manager: baseURL + (endpoints.csv_manager ?? ''),
  };

  printer = config?.printer ?? {};
  enviroment = config?.enviroment ?? '';
}

