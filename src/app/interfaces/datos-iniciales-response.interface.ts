import { vwsucursal } from '../models/app.db.interfaces';
import { ApiResponse } from './api-response.interface';

export interface DatosInicialesBranchData {
  branches: vwsucursal[];
  count: number;
}

export type DatosInicialesBranchResponse = ApiResponse<DatosInicialesBranchData>;
