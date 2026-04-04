import { ApiResponse } from "./api-response.interface";
import { CategoriasModel } from "../models/categorias.model";
import { BodegasModule } from "../models/bodegas/bodegas.module";
import { ProductoModel } from "../models/producto/producto.module";
import { DocumentoListado } from "./documento.interface";

export interface InventarioProductsData {
  products: ProductoModel[];
  count: number;
  query: string;
}

export interface InventarioProductData {
  product: ProductoModel;
  products: ProductoModel[];
  count: number;
  query: string;
}

export interface InventarioExistenceData {
  productExistence: {
    nombreBodega: string;
    idProducto: any;
    existencia: number;
    idBodega: number;
    ordenDocumento: number;
  };
  count: number;
  query: string;
}

export interface InventarioCategoriesData {
  categories: CategoriasModel[];
  count: number;
}

export interface InventarioWarehousesData {
  warehouses: BodegasModule[];
  count: number;
}

export interface InventarioPrechartData {
  message: string;
  status: string;
  ingressId: number;
  warehouseId: number;
  items: any[];
  count: number;
  performedAt: string;
  user: string;
}

export interface InventarioProductMutationData {
  message: string;
  product: ProductoModel;
  count: number;
}

export interface InventarioReturnData {
  message: string;
  status: string;
  product: DocumentoListado;
}

export type InventarioProductsResponse = ApiResponse<InventarioProductsData>;
export type InventarioProductResponse = ApiResponse<InventarioProductData>;
export type InventarioExistenceResponse = ApiResponse<InventarioExistenceData>;
export type InventarioCategoriesResponse = ApiResponse<InventarioCategoriesData>;
export type InventarioWarehousesResponse = ApiResponse<InventarioWarehousesData>;
export type InventarioPrechartResponse = ApiResponse<InventarioPrechartData>;
export type InventarioProductMutationResponse = ApiResponse<InventarioProductMutationData>;
export type InventarioReturnResponse = ApiResponse<InventarioReturnData>;
