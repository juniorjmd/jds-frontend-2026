import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ModalCrearMarcaComponent } from '../../component/modal-crear-marca/modal-crear-marca.component';
import { ColumnasTabla } from 'src/app/interfaces/nInterfaces/columnas-tabla';
import { MarcasModel } from 'src/app/models/marcas/marcas.module';
import { ProductoService } from 'src/app/services/producto.service';
import { ApiResponse } from 'src/app/interfaces/api-response.interface';
import { GenericRecordsPayload } from 'src/app/interfaces/generic-response.interface';
import { loading } from 'src/app/models/app.loading';

@Component({
  templateUrl: './marcas.component.html',
  styleUrls: ['./marcas.component.css']
})
export class MarcasComponent implements OnInit {
  origen = 'marcas';
  marcas: MarcasModel[] = [];
  ColumnasTabla: ColumnasTabla[] = [
    { name: 'nombre', columna: 'nombre' ,editabe: true },
    { name: 'descripcion', columna: 'descripcion' },
    { name: 'nombre_estado', columna: 'nombre_estado' }
  ];

  bsModalRef!: BsModalRef;

  constructor(
    private modalService: BsModalService,
    private productoService: ProductoService,
    private loading: loading
  ) {}

  ngOnInit(): void {
    this.cargarMarcas();
  }

  cargarMarcas(): void {
    this.loading.show();
    this.productoService.getMarcas().subscribe({
      next: (response: ApiResponse<GenericRecordsPayload<MarcasModel>>) => {
        if (response.ok && response.data.records) {
          this.marcas = response.data.records;
          console.log('Marcas cargadas:', this.marcas);
        } else {
          this.marcas = [];
        }
      },
      error: (error) => {
        console.error('Error al cargar marcas:', error);
        this.marcas = [];
      },
      complete: () => this.loading.hide()
    });
  }

  openModal(): void {
    this.bsModalRef = this.modalService.show(ModalCrearMarcaComponent);
    this.bsModalRef.onHidden?.subscribe(() => {
      this.cargarMarcas(); // Recargar después de cerrar el modal
    });
  }
}
