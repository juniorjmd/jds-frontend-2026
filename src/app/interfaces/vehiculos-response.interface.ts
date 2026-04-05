import { ApiResponse } from "./api-response.interface";
import { GenericMutationPayload, GenericRecordsPayload } from "./generic-response.interface";
import { ServiciosCostosModule } from "../models/servicios-costos/servicios-costos.module";
import { ServiciosModule } from "../models/servicios/servicios.module";
import { TipoVehiculoModule } from "../models/tipo-vehiculo/tipo-vehiculo.module";
import { TiposServiciosModule } from "../models/tipos-servicios/tipos-servicios.module";

export interface VehiculoPropietarioLookup {
  placaVehiculo: string;
  propietario: number;
  nombrePropietario: string;
  telefono?: string;
  cod_tipo_vehiculo: number;
  idDocumento?: number;
  cajaAsignada?: number;
  tipoDocumento?: number;
  nombreCajaAsignada?: string;
  nombreTipoDoc?: string;
}

export interface VehiculoIngresoData {
  idDocumento: number;
  message: string;
}

export type VehiculoTiposResponse = ApiResponse<GenericRecordsPayload<TipoVehiculoModule>>;
export type VehiculoTiposServiciosResponse = ApiResponse<GenericRecordsPayload<TiposServiciosModule>>;
export type VehiculoServiciosResponse = ApiResponse<GenericRecordsPayload<ServiciosModule>>;
export type VehiculoServiciosCostosResponse = ApiResponse<GenericRecordsPayload<ServiciosCostosModule>>;
export type VehiculoNoAsignadosResponse = ApiResponse<GenericRecordsPayload<TipoVehiculoModule>>;
export type VehiculoPropietarioResponse = ApiResponse<GenericRecordsPayload<VehiculoPropietarioLookup>>;
export type VehiculoMutationResponse = ApiResponse<GenericMutationPayload>;
export type VehiculoIngresoResponse = ApiResponse<VehiculoIngresoData>;
