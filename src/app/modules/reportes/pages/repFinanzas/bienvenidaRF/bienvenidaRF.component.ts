import {  Component } from '@angular/core';

@Component({
  selector: 'app-bienvenida-rf', 
  template: `<section class="reportes-welcome">
  <div class="reportes-welcome__icon">
    <i class="bi bi-currency-exchange"></i>
  </div>
  <div class="reportes-welcome__copy">
    <p class="reportes-welcome__eyebrow">Reportes</p>
    <h1>Finanzas</h1>
    <p>
      Usa la navegacion superior para cambiar entre caja, gastos, movimientos entre
      cuentas, cuentas por pagar y cuentas por cobrar. La pantalla inicial ahora solo
      orienta, sin duplicar accesos dentro del contenido.
    </p>
  </div>
</section>
 `,
  styleUrls: ['./bienvenidaRF.component.css'], 
})
export class BienvenidaRFComponent { }
