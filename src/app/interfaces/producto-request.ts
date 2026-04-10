import { SoporteOperacion } from "../interface/soporte-operacion";
import { ActividadesDescuentoModel } from "../models/actividadesDescuentoModel";
import { CarteraModel } from "../models/cartera/cartera.model";
import { CategoriasModel, CategoriasVendidasModel } from "../models/categorias.model";
import { ClientesModel } from "../models/clientes/clientes.module";
import { CntClasesModel } from "../models/cnt-clases/cnt-clases.module";
import { CntCuentaMModel } from "../models/cnt-cuenta-m/cnt-cuenta-m.module";
import { CntGruposModel } from "../models/cnt-grupos/cnt-grupos.module";
import { CntOperacionesModel } from "../models/cnt-operaciones/cnt-operaciones.module";
import { CntSubCuentaModel, vwCntSubCuentaModel } from "../models/cnt-sub-cuenta/cnt-sub-cuenta.module";
import { DescuentoModule } from "../models/descuento/descuento.model";
import { EmpleadoModel, VendedorModel } from "../models/empleados/empleados.module";
import { MarcasModel } from "../models/marcas/marcas.module";
import { ParametrosModel } from "../models/parametros/parametros.model";
import { PrdExistenciasModule } from "../models/prd-existencias/prd-existencias.module";
import { PresentacionPrdModel } from "../models/presentacionPrdModel";
import { ProductoModel } from "../models/producto/producto.module";
import { TransaccionesModel, vwTransaccionesModel } from "../models/transacciones/transacciones.module";
import { TrasladosCuentasArrModel, TrasladosCuentasModel } from "../models/trasladosCuentas.";
import { UsuarioConVentaModel, UsuarioModel } from "../models/usuario.model";
import { cajaModel } from "../models/ventas/cajas.model";
import { DocumentosComprasModel, DocumentosModel } from "../models/ventas/documento.model";
import { establecimientoModel } from "../models/ventas/establecimientos.model";
import { OperacionesComponent } from "../modules/admin/modules/cuentas-contables/pages/operaciones/operaciones.component";
import { TrasladosCntComponent } from "../modules/admin/modules/traslados-cnt/traslados-cnt.component";
import { Inventario, InventarioApl, InventarioAplDetalle } from "./nInterfaces/inventario";
import { Recurso } from "./recurso";
import { ReporteMovimientoCuentas } from "./reporteMovimientoCuentas.";
import { ResumenCreditos } from "./resumenCuentas";
import { CntOperacionPrestablecidas } from "./traslados_cnt/cnt_operacion_prestablecidas.";
import { CntOperacionPrestablecidasCuentas } from "./traslados_cnt/cnt_operacion_prestablecidas_cuentas.";

export interface ProductoRequest { 
  data: ProductoModel[]; 
  producto: ProductoModel; 
  query: string;
  numdata: number;
  error: string;
}
export interface InventarioAplicadoRequest { 
  data: InventarioApl[]; 
  producto: ProductoModel; 
  query: string;
  numdata: number;
  error: string;
}
export interface InventarioAplicadoDetalleRequest { 
  data: InventarioAplDetalle[];  
  query: string;
  numdata: number;
  error: string;
}
export interface ProductoExitenciaRequest { 
  data: {nombreBodega:string, idProducto:any , existencia:number , idBodega:number};  
  query: string;
  numdata: number;
  error: string;
}

export interface ProductoExitenciasRequest { 
  data: PrdExistenciasModule[];  
  query: string;
  numdata: number;
  error: string;
}


export interface DocumentoCompraRequest { 
  data: {objeto: DocumentosComprasModel}[];
  query: string;
  numdata: number;
  error: string;
}
export interface DocumentoRequest { 
  data: {objeto:  DocumentosModel }[];
  query: string;
  numdata: number;
  error: string;
}

export interface recursoRequest { 
  data:    Recurso[];
  query: string;
  numdata: number;
  error: string;
}
 export interface perfil { 

  id?:number;
  Perf_Nombre:string;
  estado:number;
  nombreEStado?:string;
 }
 export interface perfilRequest { 
  data:    perfil[];
  query: string;
  numdata: number;
  error: string;
} 
export interface ProductosVendidosRequest { 
  data:  {idProducto:string, firstDate:Date, lastDate:Date, nombre:string, nombre2:string, nombre3:string} [];
  query: string;
  numdata: number;
  error: string;
}
export interface DescuentoRequest { 
  data:   DescuentoModule[];
  query: string;
  numdata: number;
  error: string;
}


export interface actividadesRequest { 
  data:   ActividadesDescuentoModel[];
  query: string;
  numdata: number;
  error: string;
}


export interface actividadesDetalleRequest { 
  data:  any[] ;
  query: string;
  numdata: number;
  error: string;
}
interface plazo {cuotas: number; plazos: number; }
export interface plazoRequest { 
  data:plazo[] ;
  query: string;
  numdata: number;
  error: string;
}
export interface DocumentoCierreRequest { 
  data: { documentoFinal: DocumentosModel };
  query?: string;
  numdata?: number;
  error: string;
}
export interface CarteraRequest { 
  data: CarteraModel[];
  query?: string;
  numdata?: number;
  error: string;
} 

export interface CreditosResumenRequest { 
  data: ResumenCreditos;
  query?: string;
  numdata?: number;
  error: string;
} 

export interface clienteRequest { 
  data: ClientesModel[];
  query: string;
  numdata: number;
  error: string;
}
export interface proveedorHistorico {idTercero : number
  terceroNombre : string
  fin : Date
  inicio :Date
}
export interface proveedorHistoricoRequest { 
  data: proveedorHistorico[];
  query: string;
  numdata: number;
  error: string;
}
export interface cajaRequest { 
  data: cajaModel[];
  query: string;
  numdata: number;
  error: string;
}

export interface cntClaseRequest { 
  data: CntClasesModel[];
  query: string;
  numdata: number;
  error: string;
}

export interface cntTrasladosRequest { 
  data: TrasladosCuentasArrModel[];
  query: string;
  numdata: number;
  error: string;
}


//data: {objeto: DocumentosModel}[];
export interface soporteMovimientoCntRequest { 
   data: SoporteOperacion[];
   query: string;
   numdata: number;
   error: string;
 }

export interface ejecucionTrasladosRequest { 
   
  objeto: SoporteOperacion;
  error: string;
}
export interface cntGrupoRequest { 
  data: CntGruposModel[];
  query: string;
  numdata: number;
  error: string;
}

export interface trasladosCntRequest { 
  data: CntOperacionPrestablecidas[];
  query: string;
  numdata: number;
  error: string;
}

export interface trasladosCntCuentasRequest { 
  data: CntOperacionPrestablecidasCuentas[];
  query: string;
  numdata: number;
  error: string;
}

export interface empleadoRequest { 
  data: EmpleadoModel[];
  query: string;
  numdata: number;
  error: string;
}

export interface usuarioRequest { 
  data: UsuarioModel[];
  query: string;
  numdata: number;
  error: string;
}

export interface usuarioVentasRequest { 
  data: UsuarioConVentaModel[];
  query: string;
  numdata: number;
  error: string;
}
export interface empleadoVentasRequest { 
  data: VendedorModel[];
  query: string;
  numdata: number;
  error: string;
}
export interface parametroRequest { 
  data: ParametrosModel[];
  query: string;
  numdata: number;
  error: string;
}
export interface cntCuentaMayorRequest { 
  data: CntCuentaMModel[];
  query: string;
  numdata: number;
  error: string;
}
export interface cntSubCuentaRequest { 
  data: CntSubCuentaModel[]|vwCntSubCuentaModel[];
  query: string;
  numdata: number;
  error: string;
}

export interface cntMovCuentasRequest { 
  data: ReporteMovimientoCuentas;
  query: string;
  numdata: number;
  error: string;
}


export interface cntSubCuentaVwRequest { 
  data: vwCntSubCuentaModel[];
  query: string;
  numdata: number;
  error: string;
}


export interface cntOperacionesRequest { 
  data: CntOperacionesModel[] ;
  query: string;
  numdata: number;
  error: string;
}


export interface cntTipDocOperacionesRequest { 
  data: {"tipoDocumentoFinal":number , "nombreTipoDocumentoFinal":string}[] ;
  query: string;
  numdata: number;
  error: string;
}
export interface cntDocOperacionesRequest { 
  data: {"idDocumento":number , "idDocumentoFinal":string}[] ;
  query: string;
  numdata: number;
  error: string;
}
export interface cntTransaccionesRequest { 
  data: TransaccionesModel[] |vwTransaccionesModel[];
  query: string;
  numdata: number;
  error: string;
}

export interface categoriaRequest { 
  data: CategoriasModel[] ;
  query: string;
  numdata: number;
  error: string;
}

export interface categoriaVendidosRequest { 
  data: CategoriasVendidasModel[] ;
  query: string;
  numdata: number;
  error: string;
}

export interface marcaRequest { 
  data: MarcasModel[] ;
  query: string;
  numdata: number;
  error: string;
}
export interface establecimientosRequest { 
  data: establecimientoModel[] ;
  query: string;
  numdata: number;
  error: string;
}
export interface presentacionPrdRequest { 
  data: PresentacionPrdModel[] ;
  query: string;
  numdata: number;
  error: string;
}
