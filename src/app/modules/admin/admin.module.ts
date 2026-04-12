import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { AdminRoutingModule } from './admin-routing.module'; 
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CajasDetalleComponent } from './pages/cajas/cajas-detalle.component';
import { CajasNuevaComponent } from './pages/cajas/cajas-nueva.component';  
import { GeneralesComponent } from './pages/generales.component';
import { BodegasComponent } from './pages/bodegas/bodegas.component';
import { CategoriasComponent } from './pages/categorias/categorias.component';
import { ContadoresComponent } from './pages/contadores/contadores.component';
import { CuentasCntComponent } from './modules/cuentas-contables/cuentas-cnt.component';
import { CrearComponent } from './pages/establecimientos/crear.component';
import { ImpuestosComponent } from './pages/impuestos/impuestos.component';
import { MediosDePagoComponent } from './pages/medios-de-pago/medios-de-pago.component';
import { ProductosComponent } from './pages/productos/productos.component';
import { TiposDeDocumentosComponent } from './pages/tipos-de-documentos/tipos-de-documentos.component';
import { TiposEstablComponent } from './pages/establecimientos/tipos-establ.component'; 
import { SharedModule } from '../shared/shared.module';
import { AdminCategoriasComponent } from './modals/admin-categorias/admin-categorias.component';
import { DescuentosComponent } from './pages/descuentos/descuentos.component';
import { ActividadDescuentoComponent } from './pages/actividad-descuento/actividad-descuento.component';
import { ListarActividadComponent } from './pages/actividad-descuento/listar-actividad/listar-actividad.component';
import { CrearActividadComponent } from './pages/actividad-descuento/crear-actividad/crear-actividad.component'; 
import { FindCategoriasComponent } from './modals/findCategorias/findCategorias.component';
import { FindMarcasComponent } from './modals/findMarcas/findMarcas.component';
import { FindProductosComponent } from './modals/findProductos/findProductos.component';
import { ModalFndClienteComponent } from './modals/modalFndCliente/modalFndCliente.component';
import { ModalUpdateProductoComponent } from './modals/modalUpdateProducto/modalUpdateProducto.component';
import { ModalInOutDetalleActividad } from './modals/modalExcluirIncluirDetalleActividad/modalExcluirIncluirDetalleActividad.component';
import { ModalChangeFechaActividadComponent } from './modals/modalChangeFechaActividad/modalChangeFechaActividad.component';
import { IndexComponent } from './index/index.component';
import { MedioPagoDialogComponent } from './modals/medio-pago-dialog/medio-pago-dialog.component';
import { CajaDialogComponent } from './modals/caja-dialog/caja-dialog.component';
import { ContadorDialogComponent } from './modals/contador-dialog/contador-dialog.component';
import { DescuentoDialogComponent } from './modals/descuento-dialog/descuento-dialog.component';
import { BodegaDialogComponent } from './modals/bodega-dialog/bodega-dialog.component';
import { InventarioLayoutComponent } from './components/inventario-layout/inventario-layout.component';

 
@NgModule({
  declarations: [ 
    BodegasComponent,
    GeneralesComponent,
    ContadoresComponent,
    MediosDePagoComponent,
    CategoriasComponent,
    ProductosComponent,
    TiposEstablComponent,
    TiposDeDocumentosComponent,
    CrearComponent,
    CuentasCntComponent,
    ImpuestosComponent,
    CajasNuevaComponent,
    CajasDetalleComponent,
    MedioPagoDialogComponent,
    CajaDialogComponent,
    ContadorDialogComponent,
    DescuentoDialogComponent,
    BodegaDialogComponent,
    InventarioLayoutComponent,
    AdminCategoriasComponent,
    DescuentosComponent,
    ActividadDescuentoComponent,ModalInOutDetalleActividad,ModalChangeFechaActividadComponent,
    ListarActividadComponent,ModalUpdateProductoComponent,
    CrearActividadComponent ,FindCategoriasComponent,FindMarcasComponent, FindProductosComponent,ModalFndClienteComponent, IndexComponent
  ],
  imports: [
    CommonModule,
    RouterModule, 
    AdminRoutingModule,
    FormsModule, 
    SharedModule
  ]
})
export class AdminModule { }
