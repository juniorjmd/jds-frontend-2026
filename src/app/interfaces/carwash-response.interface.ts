import { cajaResumen } from './cajaResumen.interface';

export interface CarwashBoxState {
  caja_id: number;
  requested_caja_id?: number | null;
  usuario: string;
  estado: string;
  fecha_hora_apertura: string;
  monto_inicial: number;
  motivo: string;
}

export interface CarwashSummaryData extends cajaResumen {
  caja_id: number;
  estado: string;
  usuario: string;
  arrPagos?: Array<{
    nombrepago: string;
    total: number;
  }>;
}

export interface CarwashOpenBoxData {
  message: string;
  box: CarwashBoxState;
}

export interface CarwashCloseBoxData {
  message: string;
  summary: CarwashSummaryData;
}

export interface CarwashBoxSummaryData {
  summary: CarwashSummaryData;
}
