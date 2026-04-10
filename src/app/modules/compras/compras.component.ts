import { Component } from '@angular/core';

@Component({
  selector: 'app-compras',
  templateUrl: './compras.component.html',
  styleUrls: ['./compras.component.css']
})
export class ComprasComponent {
  readonly sections = [
    { route: 'listar', label: 'Listar' },
    { route: 'crear', label: 'Nueva compra' },
    { route: 'editar', label: 'Editar compra' },
    { route: 'anular', label: 'Notas debito' },
    { route: 'listarAnulaciones', label: 'Listar notas debito' },
    { route: 'listarCxP', label: 'Cuentas por pagar' },
    { route: 'listarPagosProveedor', label: 'Pagos proveedor' },
    { route: 'abonarCredito', label: 'Abonar credito' },
  ];
}
