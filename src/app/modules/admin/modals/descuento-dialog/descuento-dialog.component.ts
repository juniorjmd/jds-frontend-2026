import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { ApiResponse } from 'src/app/interfaces/api-response.interface';
import { GenericMutationPayload } from 'src/app/interfaces/generic-response.interface';
import { DescuentoModule } from 'src/app/models/descuento/descuento.model';
import { ProductoService } from 'src/app/services/producto.service';

export interface DescuentoDialogData {
  descuento?: DescuentoModule;
}

export interface DescuentoDialogResult {
  saved: boolean;
}

@Component({
  selector: 'app-descuento-dialog',
  templateUrl: './descuento-dialog.component.html',
  styleUrls: ['./descuento-dialog.component.css']
})
export class DescuentoDialogComponent {
  descuento: DescuentoModule;

  readonly tipos = [
    { value: 'P', label: 'Porcentaje' },
    { value: 'C', label: 'Cantidad' }
  ];

  constructor(
    private productoService: ProductoService,
    public dialogo: MatDialogRef<DescuentoDialogComponent, DescuentoDialogResult>,
    @Inject(MAT_DIALOG_DATA) public data: DescuentoDialogData
  ) {
    this.descuento = this.crearDescuentoEditable(data.descuento);
  }

  get esEdicion(): boolean {
    return Number(this.descuento.id || 0) > 0;
  }

  get titulo(): string {
    return this.esEdicion ? 'Editar descuento' : 'Crear descuento';
  }

  get subtitulo(): string {
    return this.esEdicion
      ? 'Actualiza la regla comercial sin salir del listado principal.'
      : 'Configura el nuevo descuento usando el mismo modal que se reutiliza para edicion.';
  }

  cerrar(): void {
    this.dialogo.close({ saved: false });
  }

  guardar(): void {
    this.descuento.nombre = (this.descuento.nombre || '').trim();
    this.descuento.descripcion = (this.descuento.descripcion || '').trim();
    this.descuento.tipo = this.descuento.tipo || 'P';
    this.descuento.cantidad = Number(this.descuento.cantidad || 0);

    if (this.descuento.nombre === '') {
      Swal.fire('Debe ingresar el nombre del descuento', '', 'warning');
      return;
    }

    if (this.descuento.cantidad <= 0) {
      Swal.fire('Debe ingresar una cantidad valida', '', 'warning');
      return;
    }

    if (this.descuento.descripcion === '') {
      this.descuento.descripcion = this.descuento.nombre;
    }

    this.productoService.setDescuento(this.descuento).subscribe({
      next: (value: ApiResponse<GenericMutationPayload>) => {
        if (value.ok) {
          Swal.fire(
            this.esEdicion ? 'Descuento actualizado con exito' : 'Descuento creado con exito',
            '',
            'success'
          );
          this.dialogo.close({ saved: true });
          return;
        }

        Swal.fire('Error', value.error?.message ?? 'No fue posible guardar el descuento', 'error');
      },
      error: (error) => Swal.fire(this.productoService.getErrorMessage(error), '', 'error')
    });
  }

  private crearDescuentoEditable(descuento?: DescuentoModule): DescuentoModule {
    const editable = new DescuentoModule();

    if (descuento) {
      Object.assign(editable, descuento);
    }

    editable.id = editable.id || 0;
    editable.tipo = editable.tipo || 'P';
    editable.cantidad = Number(editable.cantidad || 0);
    editable.nombre = editable.nombre || '';
    editable.descripcion = editable.descripcion || '';

    return editable;
  }
}
