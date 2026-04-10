import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ServiciosModule } from 'src/app/models/servicios/servicios.module';
import { VehiculosService } from 'src/app/services/vehiculos.service';
import Swal from 'sweetalert2';
import { loading } from 'src/app/models/app.loading';
import { TiposServiciosModule } from 'src/app/models/tipos-servicios/tipos-servicios.module';
import { CustomConsole } from 'src/app/models/CustomConsole';
import { VehiculoMutationResponse, VehiculoServiciosResponse, VehiculoTiposServiciosResponse } from 'src/app/interfaces/vehiculos-response.interface';
import { ModuleBannerService } from 'src/app/services/module-banner.service';
import { ServicioVehiculoDialogComponent, ServicioVehiculoDialogResult } from '../../modals/servicio-vehiculo-dialog/servicio-vehiculo-dialog.component';
@Component({
  selector: 'app-servicios',
  templateUrl: './servicios.component.html',
  styleUrls: ['./servicios.component.css'],
})
export class ServiciosComponent implements OnInit, OnDestroy {
  serviciosAVehiculos: ServiciosModule[] = [];
  serviciosAmostrar: ServiciosModule[] = [];
  tiposServicio: TiposServiciosModule[] = [];
  filtroTipoServicio = 0;

  constructor(
    private vehiculosService: VehiculosService,
    private loading: loading,
    private dialog: MatDialog,
    private moduleBannerService: ModuleBannerService
  ) {}

  mostrarServicioPorTipo() {
    if (this.filtroTipoServicio <= 0) {
      this.serviciosAmostrar = [...this.serviciosAVehiculos];
      this.syncModuleBanner();
      return;
    }

    this.serviciosAmostrar = this.serviciosAVehiculos.filter(
      (servicioAsignado: ServiciosModule) =>
        Number(servicioAsignado.tipo_servicio) === Number(this.filtroTipoServicio)
    );
    this.syncModuleBanner();
  }

  getTiposServicios() {
    this.loading.show();
    this.vehiculosService.getTiposServicios().subscribe({next:
      (datos: VehiculoTiposServiciosResponse) => {
        CustomConsole.log(datos);

        if (datos.data.count > 0) {
          this.tiposServicio = this.normalizarRecords<TiposServiciosModule>(datos.data.records);
          CustomConsole.log(this.tiposServicio);
        } else {
          this.tiposServicio = [];
        } 
      }, error: (error) => {
        this.loading.hide();
        CustomConsole.log(error);
        Swal.fire(this.vehiculosService.getErrorMessage(error), '', 'error');
      },complete:()=>  this.loading.hide() }
    );
  }

  abrirModalServicio(servicio?: ServiciosModule): void {
    this.dialog
      .open(ServicioVehiculoDialogComponent, {
        width: 'min(760px, 95vw)',
        autoFocus: false,
        data: {
          servicio,
          tiposServicio: this.tiposServicio
        }
      })
      .afterClosed()
      .subscribe((resultado?: ServicioVehiculoDialogResult) => {
        if (resultado?.saved) {
          this.getServiciosVehiculos();
        }
      });
  }

  public borrarTipoVehiculo(tipo: ServiciosModule) {
    Swal.fire({
      title: `Seguro que quiere borrar el servicio a vehiculo : "${tipo.nombre}"`,
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        this.vehiculosService.eliminarServicios(tipo).subscribe({
          next: (respuesta: VehiculoMutationResponse) => {
            CustomConsole.log(respuesta);
            if (respuesta.ok) {
              this.getServiciosVehiculos();
              Swal.fire('Elemento eliminado con exito!', '', 'success');
            }
          },
          error: (error) => {
            Swal.fire(this.vehiculosService.getErrorMessage(error), '', 'error');
          }
        });
      }
    });
  }
  getServiciosVehiculos() {
    this.loading.show();
    this.vehiculosService.getServicios().subscribe({next:
      (datos: VehiculoServiciosResponse) => {
        CustomConsole.log(datos);
        if (datos.data.count > 0) {
          this.serviciosAVehiculos = this.normalizarRecords<ServiciosModule>(datos.data.records);
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
        Swal.fire(this.vehiculosService.getErrorMessage(error), '', 'error');
      }

  });
  }

  obtenerNombreTipo(servicio: ServiciosModule): string {
    return servicio.tipo_servicio_detalle?.nombre || servicio.nombre_tipo_servicio || 'Sin tipo';
  }

  obtenerEstado(servicio: ServiciosModule): string {
    if ((servicio.nombre_estado || '').trim() !== '') {
      return servicio.nombre_estado!;
    }

    if (Number(servicio.estado) === 1) {
      return 'Activo';
    }

    if (Number(servicio.estado) === 2) {
      return 'Inactivo';
    }

    return 'Sin definir';
  }

  trackByServicio = (index: number, servicio: ServiciosModule): number | string =>
    servicio.id ?? `${servicio.nombre}-${index}`;

  ngOnInit(): void {
    this.syncModuleBanner();
    this.getTiposServicios();
    this.getServiciosVehiculos();
  }

  ngOnDestroy(): void {
    this.moduleBannerService.clear();
  }

  private syncModuleBanner(): void {
    this.moduleBannerService.setTitle('Vehiculos', {
      helpText: 'Consulta el listado de servicios y abre el mismo formulario emergente para crear o editar.',
      meta: [
        { label: 'Submodulo', value: 'Servicios' },
        { label: 'Registros visibles', value: String(this.serviciosAmostrar.length) }
      ]
    });
  }

  private normalizarRecords<T>(records: unknown[]): T[] {
    return (records ?? []).map((record: any) => record?.obj ?? record) as T[];
  }
}
