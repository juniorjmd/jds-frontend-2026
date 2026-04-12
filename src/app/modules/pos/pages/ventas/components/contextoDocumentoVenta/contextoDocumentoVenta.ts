import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { EmpleadoModel } from 'src/app/models/empleados/empleados.module';
import { DocumentosModel } from 'src/app/models/ventas/documento.model';

@Component({
  selector: 'app-contexto-documento-venta',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './contextoDocumentoVenta.html',
  styleUrls: ['./contextoDocumentoVenta.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContextoDocumentoVenta {
  @Input() documentoActivo: DocumentosModel | null = null;
  @Input() empleadoActivo: EmpleadoModel | null = null;
  @Input() documentos: DocumentosModel[] = [];

  @Output() buscarCliente = new EventEmitter<void>();
  @Output() cambiarVendedor = new EventEmitter<EmpleadoModel>();
  @Output() refrescarDocumentos = new EventEmitter<void>();
  @Output() cambiarDocumentoActivo = new EventEmitter<DocumentosModel>();
}
