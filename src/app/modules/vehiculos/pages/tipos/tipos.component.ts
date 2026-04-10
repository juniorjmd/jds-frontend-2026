import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { VehiculoMutationResponse, VehiculoTiposResponse } from 'src/app/interfaces/vehiculos-response.interface';
import { loading } from 'src/app/models/app.loading';
import { CustomConsole } from 'src/app/models/CustomConsole';
import { TipoVehiculoModule } from 'src/app/models/tipo-vehiculo/tipo-vehiculo.module';
import { ModuleBannerService } from 'src/app/services/module-banner.service';
import { VehiculosService } from 'src/app/services/vehiculos.service';
import { TipoVehiculoDialogComponent, TipoVehiculoDialogResult } from '../../modals/tipo-vehiculo-dialog/tipo-vehiculo-dialog.component';
@Component({
  selector: 'app-tipos',
  templateUrl: './tipos.component.html',
  styleUrls: ['./tipos.component.css'],
})
export class TiposComponent implements OnInit, OnDestroy {
  tiposVehiculo: TipoVehiculoModule[] = [];

  constructor(
    private vehiculosService: VehiculosService,
    private loading: loading,
    private dialog: MatDialog,
    private moduleBannerService: ModuleBannerService
  ) {}

  abrirModalTipoVehiculo(tipoVehiculo?: TipoVehiculoModule): void {
    this.dialog.open(TipoVehiculoDialogComponent, {
      width: 'min(720px, 95vw)',
      autoFocus: false,
      data: { tipoVehiculo }
    }).afterClosed().subscribe((resultado?: TipoVehiculoDialogResult) => {
      if (resultado?.saved) {
        this.getTiposVehiculos();
      }
    });
  }

  public borrarTipoVehiculo(tipo: TipoVehiculoModule) {
    Swal.fire({
      title: `Seguro que quiere borrar el tipo de vehiculo "${tipo.nombre}"`,
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.vehiculosService.eliminarTipoDeVehiculo(tipo).subscribe({
          next: (respuesta: VehiculoMutationResponse) => {
            CustomConsole.log(respuesta);
            if (respuesta.ok) {
              this.getTiposVehiculos();
              Swal.fire('Elemento eliminado con exito!', '', 'success');
            }
          },
          error: (error) => Swal.fire(this.vehiculosService.getErrorMessage(error), '', 'error')
        });
      }
    });
  }
  
  getTiposVehiculos() {
    this.loading.show();
    this.vehiculosService.geTiposVehiculos().subscribe({
      next: (datos: VehiculoTiposResponse) => {
        CustomConsole.log(datos);

        if (datos.data.count > 0) {
          this.tiposVehiculo = datos.data.records;
          CustomConsole.log(this.tiposVehiculo);
        } else {
          this.tiposVehiculo = [];
        }

        this.loading.hide();
      },
      error: (error) => {
        this.loading.hide();
        CustomConsole.log(error);
        Swal.fire(this.vehiculosService.getErrorMessage(error), '', 'error');
      }
    });
  }

  obtenerEstado(tipoVehiculo: TipoVehiculoModule): string {
    if ((tipoVehiculo.nombre_estado || '').trim() !== '') {
      return tipoVehiculo.nombre_estado!;
    }

    if (Number(tipoVehiculo.estado) === 1) {
      return 'Activo';
    }

    if (Number(tipoVehiculo.estado) === 2) {
      return 'Inactivo';
    }

    return 'Sin definir';
  }

  trackByTipoVehiculo = (index: number, tipoVehiculo: TipoVehiculoModule): number | string =>
    tipoVehiculo.id ?? `${tipoVehiculo.nombre}-${index}`;

  ngOnInit(): void {
    this.syncModuleBanner();
    this.getTiposVehiculos();
  }

  ngOnDestroy(): void {
    this.moduleBannerService.clear();
  }

  private syncModuleBanner(): void {
    this.moduleBannerService.setTitle('Vehiculos', {
      helpText: 'Administra el listado de tipos de vehiculo y abre el mismo formulario emergente para crear o editar.',
      meta: [
        { label: 'Submodulo', value: 'Tipos' },
        { label: 'Registros visibles', value: String(this.tiposVehiculo.length) }
      ]
    });
  }

}
