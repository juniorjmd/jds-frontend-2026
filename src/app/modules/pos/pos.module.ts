import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PosRoutingModule } from './pos-routing.module';
import { AbrirCajaComponent } from './pages/abrir-caja/abrir-caja.component';
import { BuscarProdDirectoComponent } from './modals/buscar-prod-directo/buscar-prod-directo.component';
import { CerrarCajaComponent } from './pages/cerrar-caja/cerrar-caja.component';
import { DefinirBaseCajaComponent } from './modals/definir-base-caja/definir-base-caja.component';
import { MostrarProductoComponent } from './modals/mostrar-producto/mostrar-producto.component';
import { MoverDocumentosComponent } from './modals/mover-documentos/mover-documentos.component';
import { PagosVentaComponent } from './modals/pagos-venta/pagos-venta.component';
import { POSComponent } from './pages/pos.component';
import { ResumenCajaComponent } from './modals/resumen-caja/resumen-caja.component';
import { VentasComponent } from './pages/ventas/ventas.component';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { IngresarProductoVentaComponent } from './modals/ingresar-producto-venta/ingresar-producto-venta.component';
import { NewGastoComponent } from './modals/new-gasto/new-gasto.component';
import { AbonosCuentasXCobrarComponent } from './modals/abonos-cuentas-xcobrar/abonos-cuentas-xcobrar.component';
import { GenerarCntPorCobrarComponent } from './modals/generar-cnt-por-cobrar/generar-cnt-por-cobrar.component';
import { ModalUpdateProductoVentaComponent } from './modals/ModalUpdateProductoVenta/ModalUpdateProductoVenta.component';
import { IngresoServicioVehiculoComponent } from './modals/ingreso_servicio_vehiculos/ingreso.component';
import { ListsMediosDePagoVenta } from './pages/ventas/components/listsMediosDePagoVenta/listsMediosDePagoVenta';
import { TotalesDocumentoVenta } from './pages/ventas/components/totalesDocumentoVenta/totalesDocumentoVenta';
import { ContextoDocumentoVenta } from './pages/ventas/components/contextoDocumentoVenta/contextoDocumentoVenta';
import { DetalleDocumentoVenta } from './pages/ventas/components/detalleDocumentoVenta/detalleDocumentoVenta';
import { ResumenVentaDocumento } from './pages/ventas/components/resumenVentaDocumento/resumenVentaDocumento';

@NgModule({
  declarations: [
    POSComponent,
    VentasComponent,
    AbrirCajaComponent,
    CerrarCajaComponent,
    DefinirBaseCajaComponent,
    ResumenCajaComponent,
    MoverDocumentosComponent,
    MostrarProductoComponent,
    PagosVentaComponent,
    BuscarProdDirectoComponent,
    IngresarProductoVentaComponent ,
    NewGastoComponent,
    AbonosCuentasXCobrarComponent,
    GenerarCntPorCobrarComponent,
    ModalUpdateProductoVentaComponent,
    IngresoServicioVehiculoComponent

  ],
  imports: [
    CommonModule,
    PosRoutingModule,
    FormsModule ,
    SharedModule,
    ListsMediosDePagoVenta,
    TotalesDocumentoVenta,
    ContextoDocumentoVenta,
    DetalleDocumentoVenta,
    ResumenVentaDocumento
  ]
})
export class PosModule { }
