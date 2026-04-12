import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { DocumentoListado } from 'src/app/interfaces/documento.interface';
import { DocumentosModel } from 'src/app/models/ventas/documento.model';

@Component({
  selector: 'app-detalle-documento-venta',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalleDocumentoVenta.html',
  styleUrls: ['./detalleDocumentoVenta.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetalleDocumentoVenta {
  @Input() documentoActivo: DocumentosModel | null = null;

  @Output() eliminarLinea = new EventEmitter<DocumentoListado>();
  @Output() editarLinea = new EventEmitter<DocumentoListado>();
}
