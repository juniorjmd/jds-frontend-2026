import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { RecursoDetalle } from 'src/app/interfaces/usuario.interface';
import { CustomConsole } from 'src/app/models/CustomConsole';

@Component({
  selector: 'shared-menu-item-li',
  templateUrl: './menu-item-li.component.html',
  styleUrls: ['./menu-item-li.component.css']
})
export class MenuItemLiComponent {
  isDropdownActive:boolean = false;
  @Input() recurso!: RecursoDetalle;
  private readonly iconMap: Record<string, string> = {
    inicio: 'bi-house-door',
    home: 'bi-house-door',
    'punto de venta': 'bi-cart3',
    pos: 'bi-cart3',
    ventas: 'bi-cart3',
    vehiculos: 'bi-car-front',
    clientes: 'bi-people',
    personas: 'bi-people',
    inventario: 'bi-box-seam',
    documentos: 'bi-folder2-open',
    compras: 'bi-bag-check',
    reportes: 'bi-bar-chart-line',
    admin: 'bi-sliders',
    administracion: 'bi-sliders',
    permisos: 'bi-shield-lock',
    empleados: 'bi-person-badge',
    usuarios: 'bi-person-gear',
    'cuentas contables': 'bi-journal-text',
    traslados: 'bi-arrow-left-right',
    devoluciones: 'bi-arrow-counterclockwise',
    'notas credito': 'bi-receipt-cutoff',
    gastos: 'bi-cash-coin',
    cajas: 'bi-safe2',
    'mi usuario': 'bi-person-circle'
  };

   constructor(private router: Router){
    CustomConsole.log('recursos :::::  ',this.recurso);
    
   }

  private normalizeRoute(value: string): string {
    return value.startsWith('/') ? value : `/${value}`;
  }

  private splitRouteSegments(route: string[]): { segments: string[]; absolute: boolean } {
    const absolute = route[0]?.startsWith('/') ?? false;
    const segments = route.flatMap((part) => part.split('/').filter(Boolean));
    return { segments, absolute };
  }

  private normalizeInventoryRoute(route: string[]): string[] {
    const { segments, absolute } = this.splitRouteSegments(route);
    let normalized = [...segments];
    let isAbsolute = absolute || normalized[0] === 'home';

    if (normalized[0] === 'admin') {
      normalized = ['home', ...normalized];
      isAbsolute = true;
    }

    if (normalized[0] === 'inventarios') {
      normalized = ['home', 'admin', ...normalized];
      isAbsolute = true;
    }

    if (normalized[0] === 'inventario') {
      normalized = ['home', 'admin', 'inventarios', ...normalized];
      isAbsolute = true;
    }

    if (normalized[0] === 'home' && normalized[1] === 'admin') {
      if (normalized[2] === 'inventario') {
        normalized[2] = 'inventarios';
      }

      if (normalized[2] === 'inventarios' && normalized.length === 3) {
        normalized.push('inicio');
      }
    }

    if (normalized.length === 0) {
      return [];
    }

    return isAbsolute ? [`/${normalized[0]}`, ...normalized.slice(1)] : normalized;
  }

  getRouterLink(recurso: RecursoDetalle): string[] {
    if (!this.hasNavigableRoute(recurso)) {
      return [];
    }

    return this.normalizeInventoryRoute(recurso.direccion!);
  }

  private recursoIsActive(recurso: RecursoDetalle): boolean {
    if (this.hasNavigableRoute(recurso)) {
      return this.router.isActive(this.normalizeRoute(this.getRouterLink(recurso).join('/')), false);
    }

    return (recurso.recursosHijos ?? []).some((child) => this.recursoIsActive(child));
  }

  isActiveBranch(): boolean {
    return this.recursoIsActive(this.recurso);
  }

  hasNavigableRoute(recurso: RecursoDetalle): boolean {
    return !!(recurso.direccion && recurso.direccion.length > 0 && recurso.direccion[0] !== '');
  }

  getFallbackRoute(recurso: RecursoDetalle): string[] {
    if (this.hasNavigableRoute(recurso)) {
      return this.getRouterLink(recurso);
    }

    for (const child of recurso.recursosHijos ?? []) {
      const childRoute = this.getFallbackRoute(child);
      if (childRoute.length > 0) {
        return childRoute;
      }
    }

    return [];
  }

  childHasDeepChildren(recurso: RecursoDetalle): boolean {
    return (recurso.recursosHijos ?? []).length > 0;
  }

  showDropdown() {
    this.isDropdownActive = true;
  }

  hideDropdown() {
    this.isDropdownActive = false;
  }

  private normalizeLabel(recurso: RecursoDetalle): string {
    return `${recurso.display_nombre || recurso.nombre_recurso || ''}`
      .trim()
      .toLowerCase();
  }

  getIconClass(recurso: RecursoDetalle): string | null {
    const normalized = this.normalizeLabel(recurso);

    for (const [key, icon] of Object.entries(this.iconMap)) {
      if (normalized.includes(key)) {
        return icon;
      }
    }

    return null;
  }

  hasIcon(recurso: RecursoDetalle): boolean {
    return !!this.getIconClass(recurso);
  }
}
