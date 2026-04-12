import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { ApiResponse } from 'src/app/interfaces/api-response.interface';
import { GenericMutationPayload } from 'src/app/interfaces/generic-response.interface';
import { BodegasModule } from 'src/app/models/bodegas/bodegas.module';
import { loading } from 'src/app/models/app.loading';
import { ProductoService } from 'src/app/services/producto.service';

export interface BodegaDialogData {
  bodega?: BodegasModule;
}

export interface BodegaDialogResult {
  saved: boolean;
}

@Component({
  selector: 'app-bodega-dialog',
  templateUrl: './bodega-dialog.component.html',
  styleUrls: ['./bodega-dialog.component.css']
})
export class BodegaDialogComponent {
  bodega: BodegasModule;

  readonly tipos = [
    { value: 1, label: 'Bodega' },
    { value: 2, label: 'Bodega punto de venta' }
  ];

  constructor(
    private productoService: ProductoService,
    private loading: loading,
    public dialogo: MatDialogRef<BodegaDialogComponent, BodegaDialogResult>,
    @Inject(MAT_DIALOG_DATA) public data: BodegaDialogData
  ) {
    this.bodega = this.crearBodegaEditable(data.bodega);
  }

  get esEdicion(): boolean {
    return Number(this.bodega.id || 0) > 0;
  }

  get titulo(): string {
    return this.esEdicion ? 'Editar bodega' : 'Crear bodega';
  }

  cerrar(): void {
    this.dialogo.close({ saved: false });
  }

  guardar(): void {
    this.bodega.nombre = (this.bodega.nombre || '').trim();
    this.bodega.descripcion = (this.bodega.descripcion || '').trim();
    this.bodega.tipo = Number(this.bodega.tipo || 1);
    this.bodega.estado = Number(this.bodega.estado || 1);

    if (this.bodega.nombre === '') {
      Swal.fire('Debe ingresar el nombre de la bodega', '', 'warning');
      return;
    }

    if (this.bodega.descripcion === '') {
      this.bodega.descripcion = this.bodega.nombre;
    }

    this.loading.show();
    this.productoService.setBodega(this.bodega).subscribe({
      next: (value: ApiResponse<GenericMutationPayload>) => {
        if (value.ok) {
          Swal.fire(this.esEdicion ? 'Bodega actualizada con exito' : 'Bodega creada con exito', '', 'success');
          this.dialogo.close({ saved: true });
          return;
        }

        Swal.fire('Error', value.error?.message ?? 'No fue posible guardar la bodega', 'error');
      },
      error: (error) => Swal.fire(this.productoService.getErrorMessage(error), '', 'error'),
      complete: () => this.loading.hide()
    });
  }

  private crearBodegaEditable(bodega?: BodegasModule): BodegasModule {
    const editable = new BodegasModule('', '', 1, '');

    if (bodega) {
      Object.assign(editable, bodega);
    }

    editable.id = Number(editable.id || 0);
    editable.nombre = editable.nombre || '';
    editable.descripcion = editable.descripcion || '';
    editable.tipo = Number(editable.tipo || 1);
    editable.estado = Number(editable.estado || 1);

    return editable;
  }
}
