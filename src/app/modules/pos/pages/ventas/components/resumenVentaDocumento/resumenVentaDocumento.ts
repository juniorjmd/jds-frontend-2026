import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DocumentosModel } from 'src/app/models/ventas/documento.model';

@Component({
  selector: 'app-resumen-venta-documento',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resumenVentaDocumento.html',
  styleUrls: ['./resumenVentaDocumento.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResumenVentaDocumento {
  @Input() documentoActivo: DocumentosModel | null = null;
}
