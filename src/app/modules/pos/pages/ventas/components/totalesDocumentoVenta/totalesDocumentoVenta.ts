import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DocumentosModel } from 'src/app/models/ventas/documento.model';

@Component({
  selector: 'app-totales-documento-venta',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './totalesDocumentoVenta.html',
  styleUrls: ['./totalesDocumentoVenta.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TotalesDocumentoVenta {
  @Input() documentoActivo: DocumentosModel | null = null;
 }
