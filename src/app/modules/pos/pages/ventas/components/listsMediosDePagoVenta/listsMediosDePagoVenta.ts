import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MediosDePago } from 'src/app/interfaces/medios-de-pago.interface';

@Component({
  selector: 'app-lists-medios-de-pago-venta',
  standalone: true,
  imports: [CommonModule, FormsModule ],
  templateUrl: './listsMediosDePagoVenta.html',
  styleUrls: ['./listsMediosDePagoVenta.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListsMediosDePagoVenta {
  @Input() MedioP:MediosDePago[] = [];
}
