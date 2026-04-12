import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { ApiResponse } from 'src/app/interfaces/api-response.interface';
import { Contador } from 'src/app/interfaces/contador';
import { GenericMutationPayload } from 'src/app/interfaces/generic-response.interface';
import { TipoDocumento } from 'src/app/interfaces/tipo-documento';
import { loading } from 'src/app/models/app.loading';
import { establecimientoModel } from 'src/app/models/ventas/establecimientos.model';
import { cajasServices } from 'src/app/services/Cajas.services';

export interface ContadorDialogData {
  contador?: Contador;
  tiposContador: TipoDocumento[];
  establecimientos: establecimientoModel[];
}

export interface ContadorDialogResult {
  saved: boolean;
}

@Component({
  selector: 'app-contador-dialog',
  templateUrl: './contador-dialog.component.html',
  styleUrls: ['./contador-dialog.component.css']
})
export class ContadorDialogComponent {
  contador: Contador;

  constructor(
    private serviceCaja: cajasServices,
    private loading: loading,
    public dialogo: MatDialogRef<ContadorDialogComponent, ContadorDialogResult>,
    @Inject(MAT_DIALOG_DATA) public data: ContadorDialogData
  ) {
    this.contador = this.crearContadorEditable(data.contador);
  }

  get esEdicion(): boolean {
    return Number(this.contador.id || 0) > 0;
  }

  get titulo(): string {
    return this.esEdicion ? 'Editar contador' : 'Crear contador';
  }

  get subtitulo(): string {
    return this.esEdicion
      ? 'Actualiza el consecutivo desde el mismo modal que se usa para crear nuevos registros.'
      : 'Configura el prefijo, su rango de numeracion y la vigencia opcional de resolucion.';
  }

  cerrar(): void {
    this.dialogo.close({ saved: false });
  }

  guardar(): void {
    this.contador.codContador = (this.contador.codContador || '').trim().toUpperCase();
    this.contador.establecimiento = Number(this.contador.establecimiento || 0);
    this.contador.tipoContador = Number(this.contador.tipoContador || 0);
    this.contador.desde = Number(this.contador.desde || 0);
    this.contador.hasta = Number(this.contador.hasta || 0);
    this.contador.resolucion = (this.contador.resolucion || '').trim();

    if (this.contador.codContador === '') {
      Swal.fire('Debe ingresar el codigo del contador', '', 'warning');
      return;
    }

    if (this.contador.establecimiento <= 0) {
      Swal.fire('Debe escoger el establecimiento', '', 'warning');
      return;
    }

    if (this.contador.tipoContador <= 0) {
      Swal.fire('Debe escoger el tipo de contador', '', 'warning');
      return;
    }

    if (this.contador.desde <= 0) {
      Swal.fire('Debe ingresar un valor inicial valido', '', 'warning');
      return;
    }

    if (this.contador.hasta <= 0 || this.contador.hasta < this.contador.desde) {
      Swal.fire('El valor final debe ser mayor o igual al inicial', '', 'warning');
      return;
    }

    if (this.contador.resolucion !== '') {
      if (!this.contador.fechaInicioResolucion || !this.contador.fechaFinResolucion) {
        Swal.fire('Debes completar la vigencia de la resolucion', '', 'warning');
        return;
      }

      const fechaInicio = new Date(this.contador.fechaInicioResolucion);
      const fechaFin = new Date(this.contador.fechaFinResolucion);
      if (fechaFin < fechaInicio) {
        Swal.fire('La fecha final no puede ser menor que la fecha inicial', '', 'warning');
        return;
      }
    }

    this.loading.show();
    this.serviceCaja.setConsecutivo(this.contador).subscribe({
      next: (respuesta: ApiResponse<GenericMutationPayload>) => {
        if (respuesta.ok) {
          Swal.fire(
            this.esEdicion ? 'Contador actualizado con exito' : 'Contador creado con exito',
            '',
            'success'
          );
          this.dialogo.close({ saved: true });
          return;
        }

        Swal.fire(respuesta.error?.message || 'No fue posible guardar el contador', '', 'error');
      },
      error: (error) => Swal.fire(this.serviceCaja.getErrorMessage(error), '', 'error'),
      complete: () => this.loading.hide()
    });
  }

  private crearContadorEditable(contador?: Contador): Contador {
    const editable: Contador = {
      id: 0,
      codContador: '',
      establecimiento: 0,
      contador: 0,
      tipoContador: 0,
      contador_real_establecimiento: 0,
      estado: 0,
      desde: 0,
      hasta: 0,
      resolucion: ''
    };

    if (contador) {
      Object.assign(editable, contador);
    }

    editable.id = Number(editable.id || 0);
    editable.codContador = editable.codContador || '';
    editable.establecimiento = Number(editable.establecimiento || 0);
    editable.tipoContador = Number(editable.tipoContador || 0);
    editable.desde = Number(editable.desde || 0);
    editable.hasta = Number(editable.hasta || 0);
    editable.resolucion = editable.resolucion || '';

    return editable;
  }
}
