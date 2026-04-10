import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RecursoDetalle, Usuario } from 'src/app/interfaces/usuario.interface';
import { CustomConsole } from 'src/app/models/CustomConsole';
import { PrinterManager } from 'src/app/models/printerManager';
import { DatosInicialesService } from 'src/app/services/DatosIniciales.services';
import { usuarioService } from 'src/app/services/usuario.services';

@Component({
  selector: 'app-inicio-rep-ventas', 
  template: `<section class="module-shell">
  <nav class="module-shell__tabs" aria-label="Secciones de reportes de ventas">
      <a
          class="module-shell__tab"
          routerLinkActive="is-active"
          *ngFor="let item of menusUsuario"
          [routerLink]="item.direccion"
      >
          {{ item.display_nombre }}
      </a>
  </nav>

  <div class="module-shell__content">
      <router-outlet></router-outlet>
  </div>
</section>
`,
  styleUrls: ['./inicioRepVentas.component.css'], 
})
export class InicioRepVentasComponent  { 
  private _datosInicialesService = inject( DatosInicialesService );
  private usuarioService = inject( usuarioService );
  
  menusUsuario: RecursoDetalle[] = [];
  usuario?: Usuario;
  ngOnInit(): void {
    this.usuarioService.currentUsuario.subscribe((usuario) => {  this.usuario = usuario ; 
      CustomConsole.log('InicioRepVentasComponent - usuarioLogueado' , this.usuario);
      
      let recursos =  this.usuario?.permisos.find(x=> x.nombre_recurso  == "reportes")?.recursosHijos ; 

      this.menusUsuario =  recursos?.find(x=> x.nombre_recurso  == "ventas")?.recursosHijos||[] ; 

      CustomConsole.log('InicioRepVentasComponent - permisos ' , this.menusUsuario  );
      
    });
    this._datosInicialesService.currentSucursal.subscribe({next:(suc)=>{   
       PrinterManager.setSucursal(suc!);   
    }})}
}
