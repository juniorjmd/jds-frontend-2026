import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { ApiResponse } from 'src/app/interfaces/api-response.interface';
import { GenericMutationPayload } from 'src/app/interfaces/generic-response.interface';
import { Establecimientos } from 'src/app/interfaces/establecimientos.interface';
import { MediosDePago } from 'src/app/interfaces/medios-de-pago.interface';
import { responseSubC } from 'src/app/interfaces/odoo-prd';
import { loading } from 'src/app/models/app.loading';
import { CustomConsole } from 'src/app/models/CustomConsole';
import { MediosDePagoModel } from 'src/app/models/ventas/medios-de-pago.model';
import { cajasServices } from 'src/app/services/Cajas.services';
import { ModalCntSubCuentasComponent } from '../cuentasContables/cnt-sub-cuentas.component';

export interface MedioPagoDialogData {
  medio?: MediosDePago;
  establecimientos: Establecimientos[];
}

export interface MedioPagoDialogResult {
  saved: boolean;
}

@Component({
  selector: 'app-medio-pago-dialog',
  templateUrl: './medio-pago-dialog.component.html',
  styleUrls: ['./medio-pago-dialog.component.css']
})
export class MedioPagoDialogComponent {
  readonly estados = [
    { value: 1, label: 'Activo' },
    { value: 2, label: 'Inactivo' },
  ];

  medio: MediosDePagoModel;

  constructor(
    private serviceCaja: cajasServices,
    private loading: loading,
    private dialog: MatDialog,
    public dialogo: MatDialogRef<MedioPagoDialogComponent, MedioPagoDialogResult>,
    @Inject(MAT_DIALOG_DATA) public data: MedioPagoDialogData
  ) {
    this.medio = this.crearMedioEditable(data.medio);
  }

  get esEdicion(): boolean {
    return Number(this.medio.id || 0) > 0;
  }

  get titulo(): string {
    return this.esEdicion ? 'Editar medio de pago' : 'Crear medio de pago';
  }

  get subtitulo(): string {
    return this.esEdicion
      ? 'Actualiza el mismo formulario que se usa para crear un nuevo medio.'
      : 'Registra un nuevo medio de pago y asigna su cuenta contable.';
  }

  cerrar(): void {
    this.dialogo.close({ saved: false });
  }

  buscarCuentasContables(): void {
    this.dialog
      .open(ModalCntSubCuentasComponent, { data: null })
      .afterClosed()
      .subscribe((response: responseSubC) => {
        CustomConsole.log('buscarCuentasContables medio pago', response);
        if (response?.confirmado && response.datoDevolucion !== undefined) {
          this.medio.nombreCuentaContable = response.datoDevolucion.nombre_scuenta!;
          this.medio.cuentaContable = response.datoDevolucion.id_scuenta!;
        }
      });
  }

  guardar(): void {
    this.medio.nombre = (this.medio.nombre || '').trim();
    this.medio.descripcion = (this.medio.descripcion || '').trim();
    this.medio.estado = Number(this.medio.estado || 0);
    this.medio.establecimiento = Number(this.medio.establecimiento || 0);

    if (this.medio.nombre === '') {
      Swal.fire('Debe ingresar el nombre del medio de pago', '', 'warning');
      return;
    }

    if (this.medio.descripcion === '') {
      this.medio.descripcion = this.medio.nombre;
    }

    if (this.medio.estado <= 0) {
      Swal.fire('Debe escoger un estado', '', 'warning');
      return;
    }

    if (this.medio.establecimiento <= 0) {
      Swal.fire('Debe escoger un establecimiento', '', 'warning');
      return;
    }

    this.loading.show();
    this.serviceCaja.setMedioDePago(this.medio).subscribe({
      next: (respuesta: ApiResponse<GenericMutationPayload>) => {
        if (respuesta.ok) {
          Swal.fire(
            this.esEdicion ? 'Medio de pago actualizado con exito' : 'Medio de pago creado con exito',
            '',
            'success'
          );
          this.dialogo.close({ saved: true });
          return;
        }

        Swal.fire(respuesta.error?.message || 'No fue posible guardar el medio de pago', '', 'error');
      },
      error: (error) => {
        Swal.fire(this.serviceCaja.getErrorMessage(error), '', 'error');
      },
      complete: () => this.loading.hide()
    });
  }

  private crearMedioEditable(medio?: MediosDePago): MediosDePagoModel {
    const editable = new MediosDePagoModel();

    if (medio) {
      Object.assign(editable, medio);
    }

    editable.id = editable.id || 0;
    editable.nombre = editable.nombre || '';
    editable.descripcion = editable.descripcion || '';
    editable.estado = Number(editable.estado || 0);
    editable.cuentaContable = Number(editable.cuentaContable || 0);
    editable.establecimiento = Number(editable.establecimiento || 0);
    editable.nombreCuentaContable = editable.nombreCuentaContable || '';

    return editable;
  }
}
