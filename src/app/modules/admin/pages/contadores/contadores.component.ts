import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { establecimientoModel } from 'src/app/models/ventas/establecimientos.model';
import { cajasServices } from 'src/app/services/Cajas.services';
import { loading } from 'src/app/models/app.loading';
import { TipoDocumento } from 'src/app/interfaces/tipo-documento';
import { Contador } from 'src/app/interfaces/contador';
import { CustomConsole } from 'src/app/models/CustomConsole';
import { ApiResponse } from 'src/app/interfaces/api-response.interface';
import { GenericRecordsPayload } from 'src/app/interfaces/generic-response.interface';
import {
  ContadorDialogComponent,
  ContadorDialogResult
} from '../../modals/contador-dialog/contador-dialog.component';

@Component({
  selector: 'app-contadores',
  templateUrl: './contadores.component.html',
  styleUrls: ['./contadores.component.css']
})
export class ContadoresComponent implements OnInit {
  tipContadores :TipoDocumento [] = [];
  contadores :Contador [] = [] ;
  esta : establecimientoModel[] = [];
  filtroContadores = '';
  paginaActual = 1;
  tamanoPagina = 10;
  readonly tamanosPagina = [5, 10, 20, 50];

  constructor(
    private serviceCaja : cajasServices,
    private dialog: MatDialog,
    private loading : loading ) { 
      this.getTiposDocumentosConContadores(); 
      this.getEstablecimientos();
      this.getContadores();
  }

  ngOnInit(): void {
    this.serviceCaja.currentArrEsta.subscribe({
      next: (esta: establecimientoModel[] | null) => {
        if (esta && esta.length > 0) {
          this.esta = esta;
        }
      }
    });
  }

  get contadoresFiltrados(): Contador[] {
    const term = this.filtroContadores.trim().toLowerCase();
    if (term === '') {
      return this.contadores;
    }

    return this.contadores.filter((contador) =>
      [
        contador.codContador,
        contador.nombreEstablecimiento,
        contador.nombreTipo,
        contador.nombre_estado,
        contador.resolucion,
        contador.contador,
        contador.contador_real_establecimiento
      ]
        .filter((value) => value !== undefined && value !== null)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.contadoresFiltrados.length / this.tamanoPagina));
  }

  get contadoresPaginados(): Contador[] {
    const start = (this.paginaActual - 1) * this.tamanoPagina;
    return this.contadoresFiltrados.slice(start, start + this.tamanoPagina);
  }

  actualizarFiltro(): void {
    this.paginaActual = 1;
  }

  cambiarTamanoPagina(): void {
    this.paginaActual = 1;
  }

  irAPagina(page: number): void {
    this.paginaActual = Math.min(Math.max(page, 1), this.totalPaginas);
  }

  abrirModalContador(contador?: Contador): void {
    if (this.tipContadores.length === 0 || this.esta.length === 0) {
      Swal.fire('Datos incompletos', 'Todavia no se cargan los catalogos necesarios para editar el contador.', 'warning');
      return;
    }

    this.dialog
      .open(ContadorDialogComponent, {
        width: 'min(860px, 96vw)',
        autoFocus: false,
        data: {
          contador,
          tiposContador: this.tipContadores,
          establecimientos: this.esta
        }
      })
      .afterClosed()
      .subscribe((resultado?: ContadorDialogResult) => {
        if (resultado?.saved) {
          this.getContadores();
        }
      });
  }

  getTiposDocumentosConContadores(): void {
    this.tipContadores = [];
    this.serviceCaja.getTiposDocumentosConContadores().subscribe({
      next: (datos: ApiResponse<GenericRecordsPayload<TipoDocumento>>) => {
        CustomConsole.log(datos);

        if (datos.ok && datos.data.count > 0) {
          this.tipContadores = [...datos.data.records];
        }
      },
      error: (error) => {
        this.tipContadores = [];
        window.alert(this.serviceCaja.getErrorMessage(error));
      }
    });
  }

  getEstablecimientos(): void {
    this.serviceCaja.getEstablecimientos().subscribe({
      next: (datos: ApiResponse<GenericRecordsPayload<establecimientoModel>>) => {
        if (datos.ok && datos.data.count > 0) {
          this.esta = [...datos.data.records];
          this.serviceCaja.asignarEstablecimientos(this.esta);
          return;
        }

        this.esta = [];
      },
      error: (error) => {
        this.esta = [];
        window.alert(this.serviceCaja.getErrorMessage(error));
      }
    });
  }

  getContadores(): void {
    this.contadores = [];
    this.loading.show();
    this.serviceCaja.getContadores().subscribe({
      next: (datos: ApiResponse<GenericRecordsPayload<Contador>>) => {
        CustomConsole.log(datos);

        if (datos.ok && datos.data.count > 0) {
          this.contadores = [...datos.data.records];
        } else {
          this.contadores = [];
        }

        this.paginaActual = 1;
      },
      error: (error) => {
        window.alert(this.serviceCaja.getErrorMessage(error));
      },
      complete: () => this.loading.hide()
    });
  }

  trackByContador = (index: number, contador: Contador): number | string =>
    contador.id ?? `${contador.codContador}-${index}`;
}
