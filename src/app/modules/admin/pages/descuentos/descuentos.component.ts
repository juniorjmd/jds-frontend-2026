import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DescuentoModule } from 'src/app/models/descuento/descuento.model';
import { ProductoService } from 'src/app/services/producto.service';
import Swal from 'sweetalert2';
import { ApiResponse } from 'src/app/interfaces/api-response.interface';
import { GenericRecordsPayload } from 'src/app/interfaces/generic-response.interface';
import {
  DescuentoDialogComponent,
  DescuentoDialogResult
} from '../../modals/descuento-dialog/descuento-dialog.component';

@Component({
  selector: 'app-descuentos',
  templateUrl: './descuentos.component.html',
  styleUrls: ['./descuentos.component.css']
})
export class DescuentosComponent {
  descuentos: DescuentoModule[] = [];
  filtroDescuentos = '';
  paginaActual = 1;
  tamanoPagina = 10;
  readonly tamanosPagina = [5, 10, 20, 50];

  private productoService = inject(ProductoService);
  private dialog = inject(MatDialog);

  constructor() {
    this.getDescuentos();
  }

  get descuentosFiltrados(): DescuentoModule[] {
    const term = this.filtroDescuentos.trim().toLowerCase();
    if (term === '') {
      return this.descuentos;
    }

    return this.descuentos.filter((item) =>
      [
        item.nombre,
        item.descripcion,
        item.NombreTipo,
        item.cantidad
      ]
        .filter((value) => value !== undefined && value !== null)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.descuentosFiltrados.length / this.tamanoPagina));
  }

  get descuentosPaginados(): DescuentoModule[] {
    const start = (this.paginaActual - 1) * this.tamanoPagina;
    return this.descuentosFiltrados.slice(start, start + this.tamanoPagina);
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

  abrirModalDescuento(descuento?: DescuentoModule): void {
    this.dialog
      .open(DescuentoDialogComponent, {
        width: 'min(720px, 95vw)',
        autoFocus: false,
        data: {
          descuento
        }
      })
      .afterClosed()
      .subscribe((resultado?: DescuentoDialogResult) => {
        if (resultado?.saved) {
          this.getDescuentos();
        }
      });
  }

  eliminar(descuento: DescuentoModule): void {
    Swal.fire({
      title: 'Eliminar descuento',
      text: `Se eliminara el descuento "${descuento.nombre}".`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (!result.isConfirmed) {
        return;
      }

      this.productoService.deleteDescuento(descuento).subscribe({
        next: (value) => {
          if (value.ok) {
            Swal.fire('Descuento eliminado con exito', '', 'success');
            this.getDescuentos();
            return;
          }

          Swal.fire('Error', value.error?.message ?? 'No fue posible eliminar el descuento', 'error');
        },
        error: (error) => Swal.fire(this.productoService.getErrorMessage(error), '', 'error')
      });
    });
  }

  getDescuentos(): void {
    this.productoService.getDescuentos().subscribe({
      next: (value: ApiResponse<GenericRecordsPayload<DescuentoModule>>) => {
        if (value.ok && value.data.count > 0) {
          this.descuentos = value.data.records;
        } else {
          this.descuentos = [];
        }

        this.paginaActual = 1;
      },
      error: (error) => Swal.fire(this.productoService.getErrorMessage(error), '', 'error')
    });
  }

  trackByDescuento = (index: number, descuento: DescuentoModule): number | string =>
    descuento.id ?? `${descuento.nombre}-${index}`;
}
