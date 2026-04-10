import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { RecursoDetalle, Usuario } from 'src/app/interfaces/usuario.interface';
import { usuarioService } from 'src/app/services/usuario.services';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {

  usuario?: Usuario;
  cargandoUsuario = true;
  fechaActual = new Date();

  permisosUsuario: RecursoDetalle[] = [];
  tarjetasInicio: RecursoDetalle[] = [];
  accesosRapidos: RecursoDetalle[] = [];

  totalPermisos = 0;
  totalTarjetas = 0;
  totalAccesos = 0;

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly usuarioService: usuarioService,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    this.usuarioService.currentUsuario
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (usuario) => {
          this.usuario = usuario ?? undefined;

          if (!this.usuario) {
            this.limpiarVista();
            return;
          }

          this.cargarVistaInicio(this.usuario);
        },
        error: (error) => {
          console.error('Error al obtener el usuario logueado:', error);
          this.limpiarVista();
          this.cargandoUsuario = false;
        }
      });
  }

  private cargarVistaInicio(usuario: Usuario): void {
    this.permisosUsuario = this.normalizarPermisos(usuario.permisos);

    const permisosPlanos = this.aplanarRecursos(this.permisosUsuario);

    this.tarjetasInicio = this.filtrarPorTipo(permisosPlanos, 'card');
    this.accesosRapidos = this.obtenerAccesosRapidos(permisosPlanos).slice(0, 8);

    this.totalPermisos = permisosPlanos.length;
    this.totalTarjetas = this.tarjetasInicio.filter((recurso) => this.tieneImagenValida(recurso)).length;
    this.totalAccesos = this.accesosRapidos.length;
    this.cargandoUsuario = false;
  }

  private limpiarVista(): void {
    this.usuario = undefined;
    this.permisosUsuario = [];
    this.tarjetasInicio = [];
    this.accesosRapidos = [];
    this.totalPermisos = 0;
    this.totalTarjetas = 0;
    this.totalAccesos = 0;
  }

  private normalizarPermisos(permisos: RecursoDetalle[] | undefined | null): RecursoDetalle[] {
    return Array.isArray(permisos) ? permisos : [];
  }

  private filtrarPorTipo(recursos: RecursoDetalle[], tipo: string): RecursoDetalle[] {
    return recursos.filter((recurso) =>
      String((recurso as any)?.tipo ?? '').toLowerCase().trim() === tipo.toLowerCase()
    );
  }

  private obtenerAccesosRapidos(recursos: RecursoDetalle[]): RecursoDetalle[] {
    return recursos
      .filter((recurso) => this.esAccesoRapidoValido(recurso))
      .filter((recurso, index, self) =>
        index === self.findIndex(item => this.obtenerClaveRecurso(item) === this.obtenerClaveRecurso(recurso))
      );
  }

  private esAccesoRapidoValido(recurso: RecursoDetalle): boolean {
    const tipo = String((recurso as any)?.tipo ?? '').toLowerCase().trim();

    if (tipo === 'card') {
      return false;
    }

    return this.tieneRuta(recurso);
  }

  private tieneRuta(recurso: RecursoDetalle): boolean {
    const direccion = (recurso as any)?.direccion;

    if (Array.isArray(direccion)) {
      return direccion.filter(Boolean).length > 0;
    }

    if (typeof direccion === 'string') {
      return direccion.trim().length > 0;
    }

    return false;
  }

  tieneImagenValida(recurso: RecursoDetalle): boolean {
    const imagen = this.obtenerValorImagen(recurso);

    if (!imagen) {
      return false;
    }

    if (imagen.startsWith('<') || imagen.includes('</')) {
      return false;
    }

    return this.esRutaImagen(imagen);
  }

  private aplanarRecursos(recursos: RecursoDetalle[]): RecursoDetalle[] {
    const resultado: RecursoDetalle[] = [];

    recursos.forEach((recurso) => {
      resultado.push(recurso);

      const hijos = (recurso as any)?.recursosHijos;
      if (Array.isArray(hijos) && hijos.length > 0) {
        resultado.push(...this.aplanarRecursos(hijos));
      }
    });

    return resultado;
  }

  navegar(recurso: RecursoDetalle): void {
    const direccion = (recurso as any)?.direccion;

    if (Array.isArray(direccion) && direccion.length > 0) {
      this.router.navigate(direccion);
      return;
    }

    if (typeof direccion === 'string' && direccion.trim()) {
      this.router.navigate([direccion]);
    }
  }

  obtenerNombreUsuario(): string {
    const usuario: any = this.usuario;

    return usuario?.display_nombre
      || usuario?.nombre_completo
      || usuario?.nombre
      || usuario?.usuario
      || 'Usuario';
  }

  obtenerTituloRecurso(recurso: RecursoDetalle): string {
    const item: any = recurso;

    return item?.display_nombre
      || item?.nombre_recurso
      || item?.nombre
      || 'Opción';
  }

  obtenerIconoRecurso(recurso: RecursoDetalle): string {
    const imagen = this.obtenerValorImagen(recurso);

    if (!imagen) {
      return 'bi bi-grid';
    }

    if (this.esRutaImagen(imagen)) {
      return 'bi bi-image';
    }

    if (imagen.startsWith('<')) {
      return this.extraerClasesDesdeHtml(imagen) || 'bi bi-grid';
    }

    return imagen;
  }

  obtenerRutaImagenRecurso(recurso: RecursoDetalle): string | null {
    const imagen = this.obtenerValorImagen(recurso);
    return this.esRutaImagen(imagen) ? imagen : null;
  }

  trackByRecurso = (index: number, recurso: RecursoDetalle): string =>
    this.obtenerClaveRecurso(recurso) || index.toString();

  private obtenerClaveRecurso(recurso: RecursoDetalle): string {
    const item: any = recurso;

    if (item?.id !== undefined && item?.id !== null) {
      return String(item.id);
    }

    if (item?.nombre_recurso) {
      return String(item.nombre_recurso);
    }

    if (item?.display_nombre) {
      return String(item.display_nombre);
    }

    const direccion = item?.direccion;
    if (Array.isArray(direccion)) {
      return direccion.join('/');
    }

    if (typeof direccion === 'string') {
      return direccion;
    }

    return JSON.stringify(item);
  }

  private obtenerValorImagen(recurso: RecursoDetalle): string {
    return String((recurso as any)?.img ?? '').trim();
  }

  private esRutaImagen(valor: string): boolean {
    return /^(assets\/|\.\/|\.\.\/|\/|https?:\/\/)/i.test(valor);
  }

  private extraerClasesDesdeHtml(valor: string): string {
    const coincidencia = valor.match(/class\s*=\s*["']([^"']+)["']/i);
    return coincidencia?.[1]?.trim() ?? '';
  }
}
