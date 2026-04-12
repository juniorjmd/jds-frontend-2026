import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { InventarioWarehousesResponse } from 'src/app/interfaces/inventario-response.interface';
import { BodegasModule } from 'src/app/models/bodegas/bodegas.module';
import { loading } from 'src/app/models/app.loading';
import { CustomConsole } from 'src/app/models/CustomConsole';
import { ProductoService } from 'src/app/services/producto.service';
import {
  BodegaDialogComponent,
  BodegaDialogResult
} from '../../modals/bodega-dialog/bodega-dialog.component';

@Component({
  selector: 'app-bodegas',
  templateUrl: './bodegas.component.html',
  styleUrls: ['./bodegas.component.css']
})
export class BodegasComponent {
  bodegas: BodegasModule[] = [];
  filtroBodegas = '';
  paginaActual = 1;
  tamanoPagina = 10;
  readonly tamanosPagina = [5, 10, 20, 50];

  constructor(
    private loading: loading,
    private productoService: ProductoService,
    private dialog: MatDialog
  ) {
    this.getBodegas();
  }

  get bodegasFiltradas(): BodegasModule[] {
    const term = this.filtroBodegas.trim().toLowerCase();
    if (term === '') {
      return this.bodegas;
    }

    return this.bodegas.filter((bodega) =>
      [
        bodega.nombre,
        bodega.descripcion,
        bodega.tipo_descripcion,
        bodega.nombre_estado
      ]
        .filter((value) => value !== undefined && value !== null)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.bodegasFiltradas.length / this.tamanoPagina));
  }

  get bodegasPaginadas(): BodegasModule[] {
    const start = (this.paginaActual - 1) * this.tamanoPagina;
    return this.bodegasFiltradas.slice(start, start + this.tamanoPagina);
  }

  actualizarFiltro(): void {
    this.paginaActual = 1;
  }

  cambiarTamanoPagina(): void {
    this.paginaActual = 1;
  }

  irAPagina(page: number): void {
    this.paginaActual = Math.min(Math.max(page, 1), this.totalPaginas);
  }

  getBodegas(): void {
    this.loading.show();
    this.productoService.getbodegas().subscribe({
      next: (datos: InventarioWarehousesResponse) => {
        CustomConsole.log('getBodegas', datos);
        this.bodegas = datos.ok && datos.data.count > 0 ? datos.data.warehouses : [];
        this.paginaActual = 1;
      },
      error: (error: any) => {
        this.bodegas = [];
        Swal.fire(this.productoService.getErrorMessage(error), '', 'error');
      },
      complete: () => this.loading.hide()
    });
  }

  abrirModalBodega(bodega?: BodegasModule): void {
    this.dialog
      .open(BodegaDialogComponent, {
        width: 'min(760px, 95vw)',
        autoFocus: false,
        data: { bodega }
      })
      .afterClosed()
      .subscribe((resultado?: BodegaDialogResult) => {
        if (resultado?.saved) {
          this.getBodegas();
        }
      });
  }

  setActualizacategoria(bodega: BodegasModule): void {
    this.abrirModalBodega(bodega);
  }

  setAgregarPerfil(categoria: BodegasModule): void {
    Swal.fire('Pendiente', `La asignacion de caracteristicas para "${categoria.nombre}" sigue pendiente de implementacion.`, 'info');
  }

  trackByBodega = (index: number, bodega: BodegasModule): number | string =>
    bodega.id ?? `${bodega.nombre}-${index}`;
}
