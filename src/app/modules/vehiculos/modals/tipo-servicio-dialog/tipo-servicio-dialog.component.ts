import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { VehiculoMutationResponse } from 'src/app/interfaces/vehiculos-response.interface';
import { loading } from 'src/app/models/app.loading';
import { TiposServiciosModule } from 'src/app/models/tipos-servicios/tipos-servicios.module';
import { VehiculosService } from 'src/app/services/vehiculos.service';

export interface TipoServicioDialogData {
  tipoServicio?: TiposServiciosModule;
}

export interface TipoServicioDialogResult {
  saved: boolean;
}

@Component({
  selector: 'app-tipo-servicio-dialog',
  templateUrl: './tipo-servicio-dialog.component.html',
  styleUrls: ['./tipo-servicio-dialog.component.css']
})
export class TipoServicioDialogComponent {
  tipoServicio: TiposServiciosModule;

  constructor(
    private vehiculosService: VehiculosService,
    private loading: loading,
    public dialogo: MatDialogRef<TipoServicioDialogComponent, TipoServicioDialogResult>,
    @Inject(MAT_DIALOG_DATA) public data: TipoServicioDialogData
  ) {
    this.tipoServicio = this.crearEditable(data.tipoServicio);
  }

  get esEdicion(): boolean {
    return typeof this.tipoServicio.id !== 'undefined';
  }

  cerrar(): void {
    this.dialogo.close({ saved: false });
  }

  guardar(): void {
    this.tipoServicio.nombre = (this.tipoServicio.nombre || '').trim();
    this.tipoServicio.descripcion = (this.tipoServicio.descripcion || '').trim();
    this.tipoServicio.estado = Number(this.tipoServicio.estado || 0);

    if (this.tipoServicio.nombre === '') {
      Swal.fire('Debe ingresar el nombre del tipo de servicio', '', 'warning');
      return;
    }

    if (this.tipoServicio.estado <= 0) {
      Swal.fire('Debe escoger el estado del tipo de servicio', '', 'warning');
      return;
    }

    this.loading.show();
    this.vehiculosService.guardarTiposServicios(this.tipoServicio).subscribe({
      next: (respuesta: VehiculoMutationResponse) => {
        if (respuesta.ok) {
          Swal.fire(
            this.esEdicion ? 'Tipo de servicio actualizado con exito' : 'Tipo de servicio creado con exito',
            '',
            'success'
          );
          this.dialogo.close({ saved: true });
          return;
        }

        Swal.fire(respuesta.error?.message ?? 'No fue posible guardar el tipo de servicio', '', 'error');
      },
      error: (error) => Swal.fire(this.vehiculosService.getErrorMessage(error), '', 'error'),
      complete: () => this.loading.hide()
    });
  }

  private crearEditable(tipoServicio?: TiposServiciosModule): TiposServiciosModule {
    const editable = new TiposServiciosModule('', '');

    if (tipoServicio) {
      Object.assign(editable, tipoServicio);
    }

    editable.nombre = editable.nombre || '';
    editable.descripcion = editable.descripcion || '';
    editable.estado = Number(editable.estado || 0);

    return editable;
  }
}
