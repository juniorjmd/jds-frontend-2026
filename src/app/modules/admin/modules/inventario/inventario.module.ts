import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { ApiRoutingModule } from './api-routing.module';
import { ModalCrearActDescuentoComponent } from './component/modal-crear-act-descuento/modal-crear-act-descuento.component';
import { ModalCrearBodegaComponent } from './component/modal-crear-bodega/modal-crear-bodega.component';
import { ModalCrearCategoriaComponent } from './component/modal-crear-categoria/modal-crear-categoria.component';
import { ModalCrearDescuentoComponent } from './component/modal-crear-descuento/modal-crear-descuento.component';
import { ModalCrearExistenciaComponent } from './component/modal-crear-existencia/modal-crear-existencia.component';
import { ModalCrearGrupoComponent } from './component/modal-crear-grupo/modal-crear-grupo.component';
import { ModalCrearInventarioComponent } from './component/modal-crear-inventario/modal-crear-inventario.component';
import { ModalCrearMarcaComponent } from './component/modal-crear-marca/modal-crear-marca.component';
import { ModalCrearProductoComponent } from './component/modal-crear-producto/modal-crear-producto.component';
import { ModalCrearlotesComponent } from './component/modal-crearlotes/modal-crearlotes.component';
import { ActividadesDescuentosComponent } from './pages/actividades-descuentos/actividades-descuentos.component';
import { ApiComponent } from './pages/api/api.component';
import { BodegasComponent } from './pages/bodegas/bodegas.component';
import { CategoriasComponent } from './pages/categorias/categorias.component';
import { DescuentosComponent } from './pages/descuentos/descuentos.component';
import { ExistenciasComponent } from './pages/existencias/existencias.component';
import { GruposComponent } from './pages/grupos/grupos.component';
import { InventariosComponent } from './pages/inventarios/inventarios.component';

import { FormsModule } from '@angular/forms';
import { IndexComponent } from './pages/index/index.component';
import { InventariosPorPlantillaComponent } from './pages/inventarios_por_plantilla/inventarios_por_plantilla.component';
import { InventarioModuleNavComponent } from './components/inventario-module-nav/inventario-module-nav.component';
import { MarcasComponent } from './pages/marcas/marcas.component';



@NgModule({
  declarations: [
    ApiComponent,
    InventariosComponent,
    CategoriasComponent,
    MarcasComponent,
    BodegasComponent,
    ExistenciasComponent,
    GruposComponent,
    DescuentosComponent,
    ActividadesDescuentosComponent,
    ModalCrearCategoriaComponent,
    ModalCrearProductoComponent,
    ModalCrearInventarioComponent,
    ModalCrearMarcaComponent,
    ModalCrearBodegaComponent,
    ModalCrearlotesComponent,
    ModalCrearExistenciaComponent,
    ModalCrearGrupoComponent,
    ModalCrearDescuentoComponent,
    ModalCrearActDescuentoComponent,
    InventariosPorPlantillaComponent,
    IndexComponent,
    InventarioModuleNavComponent
  ],
  imports: [
    CommonModule,
    ApiRoutingModule,
    SharedModule  ,FormsModule
  ]
})
export class InventarioModule { }
