import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { VehiculoMutationResponse } from 'src/app/interfaces/vehiculos-response.interface';
import { loading } from 'src/app/models/app.loading';
import { TipoVehiculoModule } from 'src/app/models/tipo-vehiculo/tipo-vehiculo.module';
import { VehiculosService } from 'src/app/services/vehiculos.service';

export interface TipoVehiculoDialogData {
  tipoVehiculo?: TipoVehiculoModule;
}

export interface TipoVehiculoDialogResult {
  saved: boolean;
}

@Component({
  selector: 'app-tipo-vehiculo-dialog',
  templateUrl: './tipo-vehiculo-dialog.component.html',
  styleUrls: ['./tipo-vehiculo-dialog.component.css']
})
export class TipoVehiculoDialogComponent {
  tipoVehiculo: TipoVehiculoModule;

  constructor(
    private vehiculosService: VehiculosService,
    private loading: loading,
    public dialogo: MatDialogRef<TipoVehiculoDialogComponent, TipoVehiculoDialogResult>,
    @Inject(MAT_DIALOG_DATA) public data: TipoVehiculoDialogData
  ) {
    this.tipoVehiculo = this.crearEditable(data.tipoVehiculo);
  }

  get esEdicion(): boolean {
    return typeof this.tipoVehiculo.id !== 'undefined';
  }

  cerrar(): void {
    this.dialogo.close({ saved: false });
  }

  guardar(): void {
    this.tipoVehiculo.nombre = (this.tipoVehiculo.nombre || '').trim();
    this.tipoVehiculo.descripcion = (this.tipoVehiculo.descripcion || '').trim();
    this.tipoVehiculo.estado = Number(this.tipoVehiculo.estado || 0);

    if (this.tipoVehiculo.nombre === '') {
      Swal.fire('Debe ingresar el nombre del tipo de vehiculo', '', 'warning');
      return;
    }

    if (this.tipoVehiculo.estado <= 0) {
      Swal.fire('Debe escoger el estado del tipo de vehiculo', '', 'warning');
      return;
    }

    this.loading.show();
    this.vehiculosService.guardarTipoVehiculo(this.tipoVehiculo).subscribe({
      next: (respuesta: VehiculoMutationResponse) => {
        if (respuesta.ok) {
          Swal.fire(
            this.esEdicion ? 'Tipo de vehiculo actualizado con exito' : 'Tipo de vehiculo creado con exito',
            '',
            'success'
          );
          this.dialogo.close({ saved: true });
          return;
        }

        Swal.fire(respuesta.error?.message ?? 'No fue posible guardar el tipo de vehiculo', '', 'error');
      },
      error: (error) => Swal.fire(this.vehiculosService.getErrorMessage(error), '', 'error'),
      complete: () => this.loading.hide()
    });
  }

  private crearEditable(tipoVehiculo?: TipoVehiculoModule): TipoVehiculoModule {
    const editable = new TipoVehiculoModule('', '');

    if (tipoVehiculo) {
      Object.assign(editable, tipoVehiculo);
    }

    editable.nombre = editable.nombre || '';
    editable.descripcion = editable.descripcion || '';
    editable.estado = Number(editable.estado || 0);

    return editable;
  }
}
