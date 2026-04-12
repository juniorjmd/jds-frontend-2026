import { Component, OnInit } from '@angular/core';
import { RecursoDetalle, Usuario } from 'src/app/interfaces/usuario.interface';
import { usuarioService } from 'src/app/services/usuario.services';

@Component({
  selector: 'app-inventario-module-nav',
  templateUrl: './inventario-module-nav.component.html',
  styleUrls: ['./inventario-module-nav.component.css']
})
export class InventarioModuleNavComponent implements OnInit {
  tabs: Array<{ label: string; route: string[]; exact?: boolean }> = [];

  constructor(private userService: usuarioService) {}

  ngOnInit(): void {
    this.userService.currentUsuario.subscribe((usuario: Usuario) => {
      if (!usuario) {
        this.tabs = [];
        return;
      }

      this.tabs = this.buildTabsFromPermissions(usuario);
    });
  }

  private buildTabsFromPermissions(usuario: Usuario): Array<{ label: string; route: string[]; exact?: boolean }> {
    const permisosAdmin = usuario.permisos?.find((item) => item.nombre_recurso === 'Admin');
    const permisosInventario = permisosAdmin?.recursosHijos?.find((item) => item.nombre_recurso === 'inventarios');
    const recursos = permisosInventario?.recursosHijos ?? [];

    return recursos
      .filter((recurso) => recurso.tipo === 'link')
      .map((recurso) => ({
        label: recurso.display_nombre,
        route: this.normalizeInventoryRoute(recurso),
        exact: recurso.nombre_recurso === 'inicio'
      }))
      .filter((tab) => tab.route.length > 0);
  }

  private normalizeInventoryRoute(recurso: RecursoDetalle): string[] {
    const route = recurso.direccion ?? [];
    if (route.length === 0) {
      return [];
    }

    const absolute = route[0]?.startsWith('/') ?? false;
    let segments = route.flatMap((part) => part.split('/').filter(Boolean));

    if (segments[0] === 'admin') {
      segments = ['home', ...segments];
    }

    if (segments[0] === 'inventarios') {
      segments = ['home', 'admin', ...segments];
    }

    if (segments[0] === 'inventario') {
      segments = ['home', 'admin', 'inventarios', ...segments];
    }

    if (segments[0] === 'home' && segments[1] === 'admin') {
      if (segments[2] === 'inventario') {
        segments[2] = 'inventarios';
      }

      if (segments[2] === 'inventarios' && segments.length === 3) {
        segments.push('inicio');
      }
    }

    if (segments.length === 0) {
      return [];
    }

    return absolute || segments[0] === 'home'
      ? [`/${segments[0]}`, ...segments.slice(1)]
      : segments;
  }
}
