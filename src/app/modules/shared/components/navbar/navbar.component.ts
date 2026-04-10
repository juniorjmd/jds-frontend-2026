import { Component, ElementRef, HostListener, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { vwsucursal } from 'src/app/models/app.db.interfaces';
import { LoginService } from 'src/app/services/login.services';
import { DatosInicialesService } from '../../../../services/DatosIniciales.services';
import { RecursoDetalle, Usuario } from 'src/app/interfaces/usuario.interface';
import { ModalService } from 'src/app/modal.service';
import { usuarioService } from 'src/app/services/usuario.services';
import Swal from 'sweetalert2';
import { CustomConsole } from 'src/app/models/CustomConsole';
import { ModuleBannerService } from 'src/app/services/module-banner.service';
import { Subscription, filter } from 'rxjs';
@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',

  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  llaveIncio: string;
  sucursal: vwsucursal[] = [];
  keyLog: string = '123456qwerty';
  menusUsuario: RecursoDetalle[] = [];
  usuario?: Usuario;
  isDropdownActive = false;
  isSidebarExpanded = false;
  moduleActive = '';
  readonly moduleBanner;
  private navigationSubscription?: Subscription;
  private readonly moduleTitleMap: Record<string, string> = {
    inicio: 'Inicio',
    pos: 'Punto de venta',
    ventas: 'Punto de venta',
    vehiculos: 'Vehiculos',
    personas: 'Clientes',
    clientes: 'Clientes',
    inventario: 'Inventario',
    documentos: 'Documentos',
    compras: 'Compras',
    reportes: 'Reportes',
    admin: 'Admin'
  };

  margin = 0;
  constructor(private modalService: ModalService,
    private _datosInicialesService: DatosInicialesService,private usuarioService : usuarioService,
    private _ServLogin: LoginService,
    private _Router: Router,
    private moduleBannerService: ModuleBannerService,
    private elementRef: ElementRef<HTMLElement>
  ) {
   
    this.llaveIncio = '';
    this._datosInicialesService.getDatosIniSucursal().subscribe({
      next: (data: any) => {
        this.sucursal = data;
        CustomConsole.log('getDatosIniSucursal',this.sucursal);
      },
      error: (error) => Swal.fire('getDatosIniSucursal error ',JSON.stringify(error)),
    });
    this.moduleBanner = this.moduleBannerService.state;
  }
  ngOnInit(): void {
    this.usuarioService.currentUsuario.subscribe((usuario) => {  this.usuario = usuario ; 
      CustomConsole.log('usuarioLogueado' , this.usuario);
      
    });
    this.navigationSubscription = this._Router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.isSidebarExpanded = false;
      });
  }

  ngOnDestroy(): void {
    this.navigationSubscription?.unsubscribe();
  }

  toggleSidebar(): void {
    this.isSidebarExpanded = !this.isSidebarExpanded;
  }

  closeSidebar(): void {
    this.isSidebarExpanded = false;
  }

  handleSidebarNavClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    if (target?.closest('a.app-menu-link')) {
      this.closeSidebar();
    }
  }

  @HostListener('document:keydown.escape')
  handleEscape(): void {
    this.closeSidebar();
    this.hideDropdown();
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent): void {
    const target = event.target as Node | null;

    if (target && !this.elementRef.nativeElement.contains(target)) {
      this.hideDropdown();
    }
  }

  toggleDropdown(event?: MouseEvent): void {
    event?.stopPropagation();
    this.isDropdownActive = !this.isDropdownActive;
  }

  hideDropdown(): void {
    this.isDropdownActive = false;
  }

  getCurrentModuleTitle(): string {
    const segments = this._Router.url.split('?')[0].split('/').filter(Boolean);
    const relevant = [...segments].reverse().find((segment) => this.moduleTitleMap[segment.toLowerCase()]);
    return relevant ? this.moduleTitleMap[relevant.toLowerCase()] : 'Modulo activo';
  }
 
  confirmLogout(): void {
    this.hideDropdown();
    const message = '¿Estás seguro de que deseas cerrar sesión?';
    this.modalService.openConfirmationModal(message).then((result) => {
      if (result) {
        this._Router.navigate(['/']);
      } else {
        CustomConsole.log('Cancelado');
      }
    });
  }
  changeModule(module: string) {
    this.moduleActive = `${module}`.split(',')[1];
    // alert( this.moduleActive)
    this._Router.navigate([`home/${this.moduleActive}`]);
    if (this.moduleActive === 'pos') {
      this.moduleActive = 'punto de venta';
    }
  }
}
