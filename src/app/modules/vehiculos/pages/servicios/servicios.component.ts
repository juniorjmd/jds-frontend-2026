import { Component, OnInit } from '@angular/core';
import { select } from 'src/app/interfaces/generales.interface';
import { ServiciosModule } from 'src/app/models/servicios/servicios.module';
import { VehiculosService } from 'src/app/services/vehiculos.service';
import Swal from 'sweetalert2';
import { loading } from 'src/app/models/app.loading';
import { TiposServiciosModule } from 'src/app/models/tipos-servicios/tipos-servicios.module';
import { CustomConsole } from 'src/app/models/CustomConsole';
import { VehiculoMutationResponse, VehiculoServiciosResponse, VehiculoTiposServiciosResponse } from 'src/app/interfaces/vehiculos-response.interface';
@Component({
  selector: 'app-servicios',
  templateUrl: './servicios.component.html',
  styleUrls: ['./servicios.component.css'],
})
export class ServiciosComponent implements OnInit {
  newServicioAVehiculo: ServiciosModule = new ServiciosModule('', 0, 0);
  serviciosAVehiculos: ServiciosModule[] = [];
  serviciosAmostrar: ServiciosModule[] = [];
  tiposServicio: TiposServiciosModule[] = [];

  constructor(
    private VehiculosService: VehiculosService,
    private loading: loading
  ) {
    this.getTiposServicios();
    this.getServiciosVehiculos();
  }
  mostrarServicioPorTipo() {
    this.serviciosAmostrar = [];
    if (this.newServicioAVehiculo.tipo_servicio <= 0) {
      this.serviciosAmostrar = this.serviciosAVehiculos;
      return;
    }
    let cont = 0;
    //newServicioAVehiculo.tipo_servicio
    this.serviciosAVehiculos!.forEach((servicioAsignado: ServiciosModule) => {
      CustomConsole.log(servicioAsignado);

      if (
        servicioAsignado.tipo_servicio.toString() ===
        this.newServicioAVehiculo.tipo_servicio.toString()
      ) {
        this.serviciosAmostrar[cont] = servicioAsignado;
        cont++;
      }
    });
  }

  getTiposServicios() {
    this.tiposServicio[0] = new TiposServiciosModule('', '');
    this.loading.show();
    this.VehiculosService.getTiposServicios().subscribe({next:
      (datos: VehiculoTiposServiciosResponse) => {
        CustomConsole.log(datos);

        if (datos.data.count > 0) {
          this.tiposServicio = datos.data.records;
          CustomConsole.log(this.tiposServicio);
        } else {
          this.tiposServicio = [];
        } 
      }, error: (error) => {
        this.loading.hide();
        CustomConsole.log(error);
        Swal.fire(error.error.error, '', 'error');
      },complete:()=>  this.loading.hide() }
    );
  }
  public setActualiza_servicio_vehiculo(tipo: ServiciosModule) {
    this.newServicioAVehiculo = tipo;
  }
  public borrarTipoVehiculo(tipo: ServiciosModule) {
    Swal.fire({
      title: `Seguro que quiere borrar el servicio a vehiculo : "${tipo.nombre}"`,
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        this.VehiculosService.eliminarServicios(tipo).subscribe(
          (respuesta: VehiculoMutationResponse) => {
            CustomConsole.log(respuesta);
            if (respuesta.ok) {
              this.getServiciosVehiculos();
              Swal.fire('Elemento eliminado con exito!', '', 'success');
            }
          }
        );
      }
    });
  }
  getServiciosVehiculos() {
    this.serviciosAVehiculos[0] = new ServiciosModule('', 0, 0);
    this.loading.show();
    this.VehiculosService.getServicios().subscribe({next:
      (datos: VehiculoServiciosResponse) => {
        CustomConsole.log(datos);
        if (datos.data.count > 0) {
          this.serviciosAVehiculos = datos.data.records;
          CustomConsole.log(this.serviciosAVehiculos);
        } else {
          this.serviciosAVehiculos = [];
        }
        this.mostrarServicioPorTipo();
        this.loading.hide();
      },
      error:  (error) => {
        this.loading.hide();
        CustomConsole.log(error);
        Swal.fire(error.error.error, '', 'error');
      }

  });
  }

  manageServicioVehiculo(): any {
    if (this.newServicioAVehiculo.nombre.trim() === '') {
      alert('Debe ingresar el nombre del tipo');
      return 0;
    }
    if (this.newServicioAVehiculo.estado === 0) {
      alert('Debe escoger el estado del servicio');
      return 0;
    }
    if (this.newServicioAVehiculo.tipo_servicio === 0) {
      alert('Debe escoger el estado del tipo de servicio');
      return 0;
    }
    //newServicioAVehiculo.tipo_servicio
    this.loading.show();
    this.VehiculosService.guardarServicios(this.newServicioAVehiculo).subscribe(
      (respuesta: VehiculoMutationResponse) => {
        CustomConsole.log(respuesta);

        if (respuesta.ok) {
          Swal.fire('datos ingresados con exito');
          this.newServicioAVehiculo = new ServiciosModule('', 0, 0);
          this.getServiciosVehiculos();
        } else {
          Swal.fire(respuesta.error?.message ?? 'error en el servidor', '', 'error');
        }
        this.loading.hide();
      }
    );
  }

  cancelar() {
    this.newServicioAVehiculo = new ServiciosModule('', 0, 0);
  }

  ngOnInit(): void {}
}
