import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { VehiculoMutationResponse } from 'src/app/interfaces/vehiculos-response.interface';
import { loading } from 'src/app/models/app.loading';
import { ServiciosModule } from 'src/app/models/servicios/servicios.module';
import { TiposServiciosModule } from 'src/app/models/tipos-servicios/tipos-servicios.module';
import { VehiculosService } from 'src/app/services/vehiculos.service';

export interface ServicioVehiculoDialogData {
  servicio?: ServiciosModule;
  tiposServicio: TiposServiciosModule[];
}

export interface ServicioVehiculoDialogResult {
  saved: boolean;
}

@Component({
  selector: 'app-servicio-vehiculo-dialog',
  templateUrl: './servicio-vehiculo-dialog.component.html',
  styleUrls: ['./servicio-vehiculo-dialog.component.css']
})
export class ServicioVehiculoDialogComponent {
  servicio: ServiciosModule;

  constructor(
    private vehiculosService: VehiculosService,
    private loading: loading,
    public dialogo: MatDialogRef<ServicioVehiculoDialogComponent, ServicioVehiculoDialogResult>,
    @Inject(MAT_DIALOG_DATA) public data: ServicioVehiculoDialogData
  ) {
    this.servicio = this.crearServicioEditable(data.servicio);
  }

  get esEdicion(): boolean {
    return typeof this.servicio.id !== 'undefined';
  }

  get titulo(): string {
    return this.esEdicion ? 'Editar servicio' : 'Crear servicio';
  }

  get subtitulo(): string {
    return this.esEdicion
      ? 'Actualiza el mismo formulario que se usa para crear nuevos servicios.'
      : 'Registra un nuevo servicio operativo para el modulo de vehiculos.';
  }

  cerrar(): void {
    this.dialogo.close({ saved: false });
  }

  guardar(): void {
    this.servicio.nombre = (this.servicio.nombre || '').trim();
    this.servicio.descripcion = (this.servicio.descripcion || '').trim();
    this.servicio.tipo_servicio = Number(this.servicio.tipo_servicio || 0);
    this.servicio.estado = Number(this.servicio.estado || 0);
    this.servicio.precio_general = Number(this.servicio.precio_general || 0);

    if (this.servicio.nombre === '') {
      Swal.fire('Debe ingresar el nombre del servicio', '', 'warning');
      return;
    }

    if (this.servicio.tipo_servicio <= 0) {
      Swal.fire('Debe escoger un tipo de servicio', '', 'warning');
      return;
    }

    if (this.servicio.estado <= 0) {
      Swal.fire('Debe escoger el estado del servicio', '', 'warning');
      return;
    }

    this.loading.show();
    this.vehiculosService.guardarServicios(this.servicio).subscribe({
      next: (respuesta: VehiculoMutationResponse) => {
        if (respuesta.ok) {
          Swal.fire(
            this.esEdicion ? 'Servicio actualizado con exito' : 'Servicio creado con exito',
            '',
            'success'
          );
          this.dialogo.close({ saved: true });
          return;
        }

        Swal.fire(respuesta.error?.message ?? 'No fue posible guardar el servicio', '', 'error');
      },
      error: (error) => {
        Swal.fire(this.vehiculosService.getErrorMessage(error), '', 'error');
      },
      complete: () => this.loading.hide()
    });
  }

  private crearServicioEditable(servicio?: ServiciosModule): ServiciosModule {
    const editable = new ServiciosModule('', 0, 0);

    if (servicio) {
      Object.assign(editable, servicio);
    }

    editable.nombre = editable.nombre || '';
    editable.descripcion = editable.descripcion || '';
    editable.tipo_servicio = Number(editable.tipo_servicio || 0);
    editable.estado = Number(editable.estado || 0);
    editable.precio_general = Number(editable.precio_general || 0);

    return editable;
  }
}
