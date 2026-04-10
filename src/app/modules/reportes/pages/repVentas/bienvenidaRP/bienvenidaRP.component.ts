import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RecursoDetalle, Usuario } from 'src/app/interfaces/usuario.interface';
import { CustomConsole } from 'src/app/models/CustomConsole';
import { PrinterManager } from 'src/app/models/printerManager';
import { DatosInicialesService } from 'src/app/services/DatosIniciales.services';
import { usuarioService } from 'src/app/services/usuario.services';

@Component({
  selector: 'app-bienvenida-rp', 
  template: `<section class="reportes-welcome">
  <div class="reportes-welcome__icon">
    <i class="bi bi-bar-chart-fill"></i>
  </div>
  <div class="reportes-welcome__copy">
    <p class="reportes-welcome__eyebrow">Reportes</p>
    <h1>Ventas</h1>
    <p>
      Selecciona una vista desde la franja superior para consultar comportamiento diario,
      productos, categorias, cliente, cajero o reimpresion de facturas sin duplicar la
      navegacion dentro del contenido.
    </p>
  </div>
</section>`,
  styleUrls: ['./bienvenidaRP.component.css'], 
})
export class BienvenidaRPComponent { 
  private _datosInicialesService = inject( DatosInicialesService );
  private usuarioService = inject( usuarioService );
  
  usuario?: Usuario;
  ngOnInit(): void {
    this.usuarioService.currentUsuario.subscribe((usuario) => {  this.usuario = usuario ; 
      CustomConsole.log('InicioRepVentasComponent - usuarioLogueado' , this.usuario);
      
      let recursos =  this.usuario?.permisos.find(x=> x.nombre_recurso  == "reportes")?.recursosHijos ; 

      const menusUsuario =  recursos?.find(x=> x.nombre_recurso  == "ventas")?.recursosHijos||[] ; 

      CustomConsole.log('InicioRepVentasComponent - permisos ' , menusUsuario  );
      
    });
    this._datosInicialesService.currentSucursal.subscribe({next:(suc)=>{   
       PrinterManager.setSucursal(suc!);   
    }})}
}

