import { Component, OnInit } from '@angular/core';
import { TipoVehiculoModule } from 'src/app/models/tipo-vehiculo/tipo-vehiculo.module';

import { loading } from 'src/app/models/app.loading';
import { VehiculosService } from 'src/app/services/vehiculos.service';
import { select } from 'src/app/interfaces/generales.interface';
import Swal from 'sweetalert2';
import { CustomConsole } from 'src/app/models/CustomConsole';
import { VehiculoMutationResponse, VehiculoTiposResponse } from 'src/app/interfaces/vehiculos-response.interface';
@Component({
  selector: 'app-tipos',
  templateUrl: './tipos.component.html',
  styleUrls: ['./tipos.component.css'],
})
export class TiposComponent {
  tiposVehiculo: TipoVehiculoModule[] = [];
  newTipoVehiculo: TipoVehiculoModule = new TipoVehiculoModule('', '');

  constructor(
    private VehiculosService: VehiculosService,
    private loading: loading
  ) {
    this.getTiposVehiculos();
  }
  public setActualizatipo_vehiculo(tipo: TipoVehiculoModule) {
    this.newTipoVehiculo = tipo;
  }
  public borrarTipoVehiculo(tipo: TipoVehiculoModule) {
    Swal.fire({
      title: `Seguro que quiere borrar el tipo de vehiculo "${tipo.nombre}"`,
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        this.VehiculosService.eliminarTipoDeVehiculo(tipo).subscribe(
          (respuesta: VehiculoMutationResponse) => {
            CustomConsole.log(respuesta);
            if (respuesta.ok) {
              this.getTiposVehiculos();
              Swal.fire('Elemento eliminado con exito!', '', 'success');
            }
          }
        );
      }
    });
  }
  
  getTiposVehiculos() {
    this.tiposVehiculo[0] = new TipoVehiculoModule('', '');
    this.loading.show();
    this.VehiculosService.geTiposVehiculos().subscribe(
      (datos: VehiculoTiposResponse) => {
        CustomConsole.log(datos);

        if (datos.data.count > 0) {
          datos.data.records.forEach((dato: TipoVehiculoModule, index: number) => {
            this.tiposVehiculo[index] = new TipoVehiculoModule(
              dato.nombre,

              dato.descripcion
            );
          });
          CustomConsole.log(this.tiposVehiculo);
        } else {
          this.tiposVehiculo = [];
        }

        this.loading.hide();
      },
      (error) => {
        this.loading.hide();
        CustomConsole.log(error);
        Swal.fire(error.error.error, '', 'error');
      }
    );
  }
  manageTipoVehiculo(): boolean {
    if (this.newTipoVehiculo.nombre.trim() === '') {
      alert('Debe ingresar el nombre del tipo');
      return false;
    }
    if (this.newTipoVehiculo.estado === 0) {
      alert('Debe escoger el estado del tipo');
      return false;
    }

    this.loading.show();
    this.VehiculosService.guardarTipoVehiculo(this.newTipoVehiculo).subscribe(
      (respuesta: VehiculoMutationResponse) => {
        CustomConsole.log(respuesta);

        if (respuesta.ok) {
          Swal.fire('datos ingresados con exito');
          this.newTipoVehiculo = new TipoVehiculoModule('', '');
          this.getTiposVehiculos();
        } else {
          Swal.fire(respuesta.error?.message ?? 'error en el servidor', '', 'error');
        }
        this.loading.hide();
        return true;
      }
    );
    return true;
  }

  cancelar() {
    this.newTipoVehiculo = new TipoVehiculoModule('', '');
  }
}
