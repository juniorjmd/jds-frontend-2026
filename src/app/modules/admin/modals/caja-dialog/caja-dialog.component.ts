import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { ApiResponse } from 'src/app/interfaces/api-response.interface';
import { GenericMutationPayload } from 'src/app/interfaces/generic-response.interface';
import { responseSubC } from 'src/app/interfaces/odoo-prd';
import { cajaModel } from 'src/app/models/ventas/cajas.model';
import { establecimientoModel } from 'src/app/models/ventas/establecimientos.model';
import { loading } from 'src/app/models/app.loading';
import { CustomConsole } from 'src/app/models/CustomConsole';
import { cajasServices } from 'src/app/services/Cajas.services';
import { ModalCntSubCuentasComponent } from '../cuentasContables/cnt-sub-cuentas.component';

export interface CajaDialogData {
  caja?: cajaModel;
  establecimientos: establecimientoModel[];
}

export interface CajaDialogResult {
  saved: boolean;
}

@Component({
  selector: 'app-caja-dialog',
  templateUrl: './caja-dialog.component.html',
  styleUrls: ['./caja-dialog.component.css']
})
export class CajaDialogComponent {
  readonly estados = [
    { value: 1, label: 'Activo' },
    { value: 2, label: 'Inactivo' },
  ];

  caja: cajaModel;

  constructor(
    private serviceCaja: cajasServices,
    private loading: loading,
    private dialog: MatDialog,
    public dialogo: MatDialogRef<CajaDialogComponent, CajaDialogResult>,
    @Inject(MAT_DIALOG_DATA) public data: CajaDialogData
  ) {
    this.caja = this.crearCajaEditable(data.caja);
  }

  get esEdicion(): boolean {
    return Number(this.caja.id || 0) > 0;
  }

  get titulo(): string {
    return this.esEdicion ? 'Editar caja' : 'Crear caja';
  }

  get subtitulo(): string {
    return this.esEdicion
      ? 'Actualiza la caja operativa sin salir del listado principal.'
      : 'Registra una nueva caja y vincula sus cuentas contables base.';
  }

  cerrar(): void {
    this.dialogo.close({ saved: false });
  }

  buscarCuentasContablesGastos(): void {
    this.dialog
      .open(ModalCntSubCuentasComponent, { data: null })
      .afterClosed()
      .subscribe((response: responseSubC) => {
        CustomConsole.log('buscarCuentasContablesGastos caja', response);
        if (response?.confirmado && response.datoDevolucion !== undefined) {
          this.caja.nombre_scuenta_gastos = response.datoDevolucion.nombre_scuenta;
          this.caja.cod_cuenta_gastos = response.datoDevolucion.id_scuenta;
          this.caja.cuentaContableGastos = response.datoDevolucion.id_scuenta;
        }
      });
  }

  buscarCuentasContablesEfectivo(): void {
    this.dialog
      .open(ModalCntSubCuentasComponent, { data: null })
      .afterClosed()
      .subscribe((response: responseSubC) => {
        CustomConsole.log('buscarCuentasContablesEfectivo caja', response);
        if (response?.confirmado && response.datoDevolucion !== undefined) {
          this.caja.nombre_scuenta_venta = response.datoDevolucion.nombre_scuenta;
          this.caja.cod_cuenta_venta = response.datoDevolucion.id_scuenta;
          this.caja.cuentaContableEfectivo = response.datoDevolucion.id_scuenta;
        }
      });
  }

  guardar(): void {
    this.caja.nombre = (this.caja.nombre || '').trim();
    this.caja.descripcion = (this.caja.descripcion || '').trim();
    this.caja.estadoGeneral = Number(this.caja.estadoGeneral || 0);
    this.caja.establecimiento = Number(this.caja.establecimiento || 0);

    if (this.caja.nombre === '') {
      Swal.fire('Debe ingresar el nombre de la caja', '', 'warning');
      return;
    }

    if (this.caja.descripcion === '') {
      this.caja.descripcion = this.caja.nombre;
    }

    if (this.caja.estadoGeneral <= 0) {
      this.caja.estadoGeneral = 2;
    }

    if (this.caja.establecimiento <= 0) {
      this.caja.establecimiento = 1;
    }

    if ((this.caja.cuentaContableGastos || 0) < 1) {
      Swal.fire('Debe ingresar la cuenta de gastos de la caja', '', 'warning');
      return;
    }

    if ((this.caja.cuentaContableEfectivo || 0) < 1) {
      Swal.fire('Debe ingresar la cuenta de efectivo de la caja', '', 'warning');
      return;
    }

    this.loading.show();
    this.serviceCaja.setCaja(this.caja).subscribe({
      next: (respuesta: ApiResponse<GenericMutationPayload>) => {
        if (respuesta.ok) {
          Swal.fire(
            this.esEdicion ? 'Caja actualizada con exito' : 'Caja creada con exito',
            '',
            'success'
          );
          this.dialogo.close({ saved: true });
          return;
        }

        Swal.fire(respuesta.error?.message || 'No fue posible guardar la caja', '', 'error');
      },
      error: (error) => {
        Swal.fire(this.serviceCaja.getErrorMessage(error), '', 'error');
      },
      complete: () => this.loading.hide()
    });
  }

  private crearCajaEditable(caja?: cajaModel): cajaModel {
    const editable = new cajaModel(undefined);

    if (caja) {
      Object.assign(editable, caja);
    }

    editable.nombre = editable.nombre || '';
    editable.descripcion = editable.descripcion || '';
    editable.estadoGeneral = Number(editable.estadoGeneral || 0);
    editable.establecimiento = Number(editable.establecimiento || 0);
    editable.cuentaContableGastos = Number(editable.cuentaContableGastos || 0);
    editable.cuentaContableEfectivo = Number(editable.cuentaContableEfectivo || 0);
    editable.nombre_scuenta_gastos = editable.nombre_scuenta_gastos || '';
    editable.nombre_scuenta_venta = editable.nombre_scuenta_venta || '';

    return editable;
  }
}
