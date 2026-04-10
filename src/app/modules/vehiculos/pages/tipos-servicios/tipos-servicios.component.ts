import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { VehiculoMutationResponse, VehiculoTiposServiciosResponse } from 'src/app/interfaces/vehiculos-response.interface';
import { loading } from 'src/app/models/app.loading';
import { CustomConsole } from 'src/app/models/CustomConsole';
import { TiposServiciosModule } from 'src/app/models/tipos-servicios/tipos-servicios.module';
import { ModuleBannerService } from 'src/app/services/module-banner.service';
import { VehiculosService } from 'src/app/services/vehiculos.service';
import { TipoServicioDialogComponent, TipoServicioDialogResult } from '../../modals/tipo-servicio-dialog/tipo-servicio-dialog.component';
@Component({
  selector: 'app-tipos-servicios',
  templateUrl: './tipos-servicios.component.html',
  styleUrls: ['./tipos-servicios.component.css'],
})
export class TiposServiciosComponent implements OnInit, OnDestroy {
  tiposServicio: TiposServiciosModule[] = [];

  constructor(
    private vehiculosService: VehiculosService,
    private loading: loading,
    private dialog: MatDialog,
    private moduleBannerService: ModuleBannerService
  ) {}

  abrirModalTipoServicio(tipoServicio?: TiposServiciosModule): void {
    this.dialog.open(TipoServicioDialogComponent, {
      width: 'min(720px, 95vw)',
      autoFocus: false,
      data: { tipoServicio }
    }).afterClosed().subscribe((resultado?: TipoServicioDialogResult) => {
      if (resultado?.saved) {
        this.getTiposServicios();
      }
    });
  }

  public borrarTipoVehiculo(tipo: TiposServiciosModule) {
    Swal.fire({
      title: `Seguro que quiere borrar el tipo de servicio "${tipo.nombre}"`,
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.vehiculosService.eliminarTiposServicios(tipo).subscribe({
          next: (respuesta: VehiculoMutationResponse) => {
            CustomConsole.log(respuesta);
            if (respuesta.ok) {
              this.getTiposServicios();
              Swal.fire('Elemento eliminado con exito!', '', 'success');
            }
          },
          error: (error) => Swal.fire(this.vehiculosService.getErrorMessage(error), '', 'error')
        });
      }
    });
  }

  getTiposServicios() {
    this.loading.show();
    this.vehiculosService.getTiposServicios().subscribe({
      next: (datos: VehiculoTiposServiciosResponse) => {
        CustomConsole.log(datos);
        if (datos.data.count > 0) { 
          this.tiposServicio = datos.data.records;
          CustomConsole.log(this.tiposServicio);
        } else {
          this.tiposServicio = [];
        }

        this.loading.hide();
      },
      error: (error: any) => {
        this.loading.hide();
        CustomConsole.log(error);
        Swal.fire(this.vehiculosService.getErrorMessage(error), '', 'error');
      },
    });
  }

  obtenerEstado(tipoServicio: TiposServiciosModule): string {
    if ((tipoServicio.nombre_estado || '').trim() !== '') {
      return tipoServicio.nombre_estado!;
    }

    if (Number(tipoServicio.estado) === 1) {
      return 'Activo';
    }

    if (Number(tipoServicio.estado) === 2) {
      return 'Inactivo';
    }

    return 'Sin definir';
  }

  trackByTipoServicio = (index: number, tipoServicio: TiposServiciosModule): number | string =>
    tipoServicio.id ?? `${tipoServicio.nombre}-${index}`;

  ngOnInit(): void {
    this.syncModuleBanner();
    this.getTiposServicios();
  }

  ngOnDestroy(): void {
    this.moduleBannerService.clear();
  }

  private syncModuleBanner(): void {
    this.moduleBannerService.setTitle('Vehiculos', {
      helpText: 'Administra el listado de tipos de servicio y abre el mismo formulario emergente para crear o editar.',
      meta: [
        { label: 'Submodulo', value: 'Tipos de servicios' },
        { label: 'Registros visibles', value: String(this.tiposServicio.length) }
      ]
    });
  }

}
