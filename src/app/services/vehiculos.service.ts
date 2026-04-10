import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { loading } from 'src/app/models/app.loading';
import { TipoVehiculoModule } from '../models/tipo-vehiculo/tipo-vehiculo.module';
import { actions } from '../models/app.db.actions';
import { TABLA } from '../models/app.db.tables';
import { httpOptions } from '../models/app.db.url';
import { vistas } from '../models/app.db.view';
import { TiposServiciosModule } from '../models/tipos-servicios/tipos-servicios.module';
import { ServiciosModule } from '../models/servicios/servicios.module';
import { procedure } from '../models/app.db.procedure';
import { ServiciosCostosModule } from '../models/servicios-costos/servicios-costos.module';
import { VehiculosIngresoServicioModule } from '../models/vehiculos-ingreso-servicio/vehiculos-ingreso-servicio.module';
import { CustomConsole } from '../models/CustomConsole';
import { ConfigService } from './config.service';
import {
  VehiculoIngresoResponse,
  VehiculoMutationResponse,
  VehiculoNoAsignadosResponse,
  VehiculoPropietarioResponse,
  VehiculoServiciosCostosResponse,
  VehiculoServiciosResponse,
  VehiculoTiposResponse,
  VehiculoTiposServiciosResponse,
} from '../interfaces/vehiculos-response.interface';

@Injectable({
  providedIn: 'root',
})
export class VehiculosService {
  urlVehiculo = this.configService.url.action + 'vehiculos/';

  constructor(private http: HttpClient, private loading: loading, private configService: ConfigService) {
    CustomConsole.log('servicios usuarios inicializado');
  }

  getCostosServicios(codServicio: number) {
    const where = [{ columna: 'cod_servicio', tipocomp: '=', dato: codServicio }];
    const datos = {
      action: actions.actionSelect,
      _tabla: vistas.vehiculos_servicios_costos,
      _where: where,
      _columnas: ['obj'],
      _obj: ['obj'],
    };
    CustomConsole.log('vehiculo service  - getCostosServicios', this.configService.url.action, datos, httpOptions());
    return this.http
      .post<VehiculoServiciosCostosResponse>(this.configService.url.action, datos, httpOptions())
      .pipe(map((response) => this.normalizeRecordsResponse(response)));
  }

  eliminarCostosServicios(oldTipoVh: ServiciosCostosModule) {
    const where = [{ columna: 'id', tipocomp: '=', dato: oldTipoVh.id }];
    const datos = {
      action: actions.actionDelete,
      _tabla: TABLA.vehiculos_servicios_costos,
      _where: where,
    };
    return this.http.post<VehiculoMutationResponse>(this.configService.url.action, datos, httpOptions());
  }

  guardarNuevoIngresoServicioold(nuevoTipo: VehiculosIngresoServicioModule) {
    const arrayDatos: any = {
      placaVehiculo: nuevoTipo.placaVehiculo,
      cod_servicio: nuevoTipo.cod_servicio,
      propietario: nuevoTipo.propietario,
      cod_tipo_vehiculo: nuevoTipo.cod_tipo_vehiculo,
      lavador: nuevoTipo.lavador,
      cajaAsignada: nuevoTipo.cajaAsignada,
      valor: nuevoTipo.valor,
      idDocumento: nuevoTipo.idDocumento,
    };
    const datos = {
      action: actions.actionInsertarDocumentoPorServicioIngresado,
      _arraydatos: arrayDatos,
      _where: null,
    };
    CustomConsole.log('servicios de creacion servicios de vehiculos activo', this.configService.url.action, datos, httpOptions());
    return this.http.post<VehiculoIngresoResponse>(this.configService.url.action, datos, httpOptions());
  }

  guardarNuevoIngresoServicio(nuevoTipo: VehiculosIngresoServicioModule) {
    const arrayDatos: any = {
      placaVehiculo: nuevoTipo.placaVehiculo,
      cod_servicio: nuevoTipo.cod_servicio,
      propietario: nuevoTipo.propietario,
      cod_tipo_vehiculo: nuevoTipo.cod_tipo_vehiculo,
      lavador: nuevoTipo.lavador,
      cajaAsignada: nuevoTipo.cajaAsignada,
      valor: nuevoTipo.valor,
      idDocumento: nuevoTipo.idDocumento,
    };
    const datos = {
      action: actions.actionInsertarDocumentoPorServicioIngresado,
      _tabla: TABLA.vehiculos_servicios_costos,
      _arraydatos: arrayDatos,
      _where: null,
    };

    CustomConsole.log(' servicios de vehiculos activo guardarNuevoIngresoServicio', this.urlVehiculo, datos, httpOptions());
    return this.http.post<VehiculoIngresoResponse>(this.urlVehiculo, datos, httpOptions());
  }

  guardarCostoServicio(nuevoTipo: ServiciosCostosModule) {
    CustomConsole.log('costo a guardar', nuevoTipo);
    let arrayDatos: any = {
      cod_servicio: nuevoTipo.cod_servicio,
      cod_tipo_vehiculo: nuevoTipo.cod_tipo_vehiculo,
      valor: nuevoTipo.valor,
      estado: nuevoTipo.estado,
    };
    let where: any[] = [];
    let datos: any = {
      action: actions.actionInsert,
      _tabla: TABLA.vehiculos_servicios_costos,
      _tablaSelect: '',
      _arraydatos: arrayDatos,
      _where: [],
      _deleteBefore: [],
    };

    if (nuevoTipo.cod_tipo_vehiculo == 999999999) {
      arrayDatos = {
        cod_servicio: [nuevoTipo.cod_servicio, 'int'],
        cod_tipo_vehiculo: ['id', 'tabla'],
        valor: [nuevoTipo.valor, ''],
        estado: [nuevoTipo.estado, 'int'],
      };
      datos = {
        action: actions.actionInsertSelect,
        _tabla: TABLA.vehiculos_servicios_costos,
        _tablaSelect: TABLA.tiposVehiculos,
        _arraydatos: arrayDatos,
        _where: [],
        _deleteBefore: [['cod_servicio', '=', nuevoTipo.cod_servicio]],
      };
    }

    if (typeof nuevoTipo.id !== 'undefined') {
      where = [{ columna: 'id', tipocomp: '=', dato: nuevoTipo.id }];
      datos._where = where;
      datos.action = actions.actionUpdate;
    }

    CustomConsole.log('servicios de creacion servicios de vehiculos activo', this.configService.url.action, datos, httpOptions());
    return this.http.post<VehiculoMutationResponse>(this.configService.url.action, datos, httpOptions());
  }

  getServicios() {
    const datos = {
      action: actions.actionSelect,
      _tabla: vistas.vehiculos_servicios,
      _columnas: ['obj'],
      _obj: ['obj'],
    };
    CustomConsole.log('servicios de usuarios activo - getUsuarios', this.configService.url.action, datos, httpOptions());
    return this.http
      .post<VehiculoServiciosResponse>(this.configService.url.action, datos, httpOptions())
      .pipe(map((response) => this.normalizeRecordsResponse(response)));
  }

  getVehiculoNoAsignadoAServicios(codServicio: number) {
    const arraydatos = { _id_servicio: codServicio };
    const datos = {
      action: actions.actionProcedure,
      _procedure: procedure.getTiposVehiculosNoAsignadoAservicio,
      _arraydatos: arraydatos,
    };
    CustomConsole.log('vehiculo service - getVehiculoNoAsignadoAServicios', this.configService.url.action, datos, httpOptions());
    return this.http.post<VehiculoNoAsignadosResponse>(this.configService.url.action, datos, httpOptions());
  }

  getServiciosPorTipo(tipo: number) {
    const where = [{ columna: 'tipo_servicio', tipocomp: '=', dato: tipo }];
    const datos = {
      action: actions.actionSelect,
      _tabla: vistas.vehiculos_servicios,
      _where: where,
      _columnas: ['obj'],
      _obj: ['obj'],
    };
    CustomConsole.log('vehiculoService - getServiciosPorTipo', this.configService.url.action, datos, httpOptions());
    return this.http
      .post<VehiculoServiciosResponse>(this.configService.url.action, datos, httpOptions())
      .pipe(map((response) => this.normalizeRecordsResponse(response)));
  }

  getServiciosPorTipoVehiculo(tipo: number) {
    const where = [{ columna: 'cod_tipo_vehiculo', tipocomp: '=', dato: tipo }];
    const datos = {
      action: actions.actionSelect,
      _tabla: vistas.vehiculos_servicios_costos,
      _where: where,
      _columnas: ['obj'],
      _obj: ['obj'],
    };
    CustomConsole.log('servicios de usuarios activo - getUsuarios', this.configService.url.action, datos, httpOptions());
    return this.http
      .post<VehiculoServiciosCostosResponse>(this.configService.url.action, datos, httpOptions())
      .pipe(map((response) => this.normalizeRecordsResponse(response)));
  }

  getVehiculos_propietario(tipo: string) {
    const where = [{ columna: 'placaVehiculo', tipocomp: '=', dato: tipo }];
    const datos = {
      action: actions.actionSelect,
      _tabla: vistas.vehiculos_propietario,
      _where: where,
    };
    CustomConsole.log('servicios de VEHICULOS activo - getVehiculos_propietario', this.configService.url.action, datos, httpOptions());
    return this.http
      .post<VehiculoPropietarioResponse>(this.configService.url.action, datos, httpOptions())
      .pipe(map((response) => this.normalizeRecordsResponse(response)));
  }

  eliminarServicios(oldTipoVh: ServiciosModule) {
    const where = [{ columna: 'id', tipocomp: '=', dato: oldTipoVh.id }];
    const datos = {
      action: actions.actionDelete,
      _tabla: TABLA.vehiculos_servicios,
      _where: where,
    };
    return this.http.post<VehiculoMutationResponse>(this.configService.url.action, datos, httpOptions());
  }

  public guardarServicios(nuevoTipo: ServiciosModule) {
    const arrayDatos: any = {
      usuario_creacion: 'USUARIO_LOGUEADO',
      nombre: nuevoTipo.nombre,
      descripcion: nuevoTipo.descripcion,
      estado: nuevoTipo.estado,
      tipo_servicio: nuevoTipo.tipo_servicio,
      precio_general: nuevoTipo.precio_general,
    };
    let where: any[] = [];
    const datos: any = {
      action: actions.actionInsert,
      _tabla: TABLA.vehiculos_servicios,
      _arraydatos: arrayDatos,
      _where: [[]],
    };
    if (typeof nuevoTipo.id !== 'undefined') {
      where = [{ columna: 'id', tipocomp: '=', dato: nuevoTipo.id }];
      datos._where = where;
      datos.action = actions.actionUpdate;
    }

    CustomConsole.log('servicios de creacion servicios de vehiculos activo', this.configService.url.action, datos, httpOptions());
    return this.http.post<VehiculoMutationResponse>(this.configService.url.action, datos, httpOptions());
  }

  getTiposServicios() {
    const datos = {
      action: actions.actionSelect,
      _tabla: vistas.vehiculos_servicios_tipos,
      _columnas: ['obj'],
      _obj: ['obj'],
    };
    CustomConsole.log('servicios de usuarios activo - getUsuarios', this.configService.url.action, datos, httpOptions());
    return this.http
      .post<VehiculoTiposServiciosResponse>(this.configService.url.action, datos, httpOptions())
      .pipe(map((response) => this.normalizeRecordsResponse(response)));
  }

  eliminarTiposServicios(oldTipoVh: TiposServiciosModule) {
    const where = [{ columna: 'id', tipocomp: '=', dato: oldTipoVh.id }];
    const datos = {
      action: actions.actionDelete,
      _tabla: TABLA.TiposServicios,
      _where: where,
    };
    return this.http.post<VehiculoMutationResponse>(this.configService.url.action, datos, httpOptions());
  }

  public guardarTiposServicios(nuevoTipo: TiposServiciosModule) {
    const arrayDatos: any = {
      usuario_creacion: 'USUARIO_LOGUEADO',
      nombre: nuevoTipo.nombre,
      descripcion: nuevoTipo.descripcion,
      estado: nuevoTipo.estado,
    };
    let where: any[] = [];
    const datos: any = {
      action: actions.actionInsert,
      _tabla: TABLA.TiposServicios,
      _arraydatos: arrayDatos,
      _where: [[]],
    };
    if (typeof nuevoTipo.id !== 'undefined') {
      where = [{ columna: 'id', tipocomp: '=', dato: nuevoTipo.id }];
      datos._where = where;
      datos.action = actions.actionUpdate;
    }

    CustomConsole.log('servicios de creacion tipo de vehiculo activo', this.configService.url.action, datos, httpOptions());
    return this.http.post<VehiculoMutationResponse>(this.configService.url.action, datos, httpOptions());
  }

  geTiposVehiculos() {
    const datos = {
      action: actions.actionSelect,
      _tabla: vistas.vehiculos_tipos,
    };
    CustomConsole.log('servicios de servicios vehiculos activo - geTiposVehiculos', this.configService.url.action, datos, httpOptions());
    return this.http
      .post<VehiculoTiposResponse>(this.configService.url.action, datos, httpOptions())
      .pipe(map((response) => this.normalizeRecordsResponse(response)));
  }

  eliminarTipoDeVehiculo(oldTipoVh: TipoVehiculoModule) {
    const where = [{ columna: 'id', tipocomp: '=', dato: oldTipoVh.id }];
    const datos = {
      action: actions.actionDelete,
      _tabla: TABLA.tiposVehiculos,
      _where: where,
    };
    return this.http.post<VehiculoMutationResponse>(this.configService.url.action, datos, httpOptions());
  }

  public guardarTipoVehiculo(nuevoTipo: TipoVehiculoModule) {
    const arrayDatos: any = {
      usuario_creacion: 'USUARIO_LOGUEADO',
      nombre: nuevoTipo.nombre,
      descripcion: nuevoTipo.descripcion,
      estado: nuevoTipo.estado,
    };
    let where: any[] = [];
    const datos: any = {
      action: actions.actionInsert,
      _tabla: TABLA.tiposVehiculos,
      _arraydatos: arrayDatos,
      _where: [[]],
    };
    if (typeof nuevoTipo.id !== 'undefined') {
      where = [{ columna: 'id', tipocomp: '=', dato: nuevoTipo.id }];
      datos._where = where;
      datos.action = actions.actionUpdate;
    }

    CustomConsole.log('servicios de creacion tipo de vehiculo activo', this.configService.url.action, datos, httpOptions());
    return this.http.post<VehiculoMutationResponse>(this.configService.url.action, datos, httpOptions());
  }

  getErrorMessage(error: any): string {
    return error?.error?.error?.message
      ?? error?.error?.error?.message
      ?? error?.error?.message
      ?? error?.message
      ?? 'Error inesperado';
  }

  private normalizeRecordsResponse<T extends { data?: { records?: any[] } }>(response: T): T {
    if (!response?.data || !Array.isArray(response.data.records)) {
      return response;
    }

    return {
      ...response,
      data: {
        ...response.data,
        records: response.data.records.map((record: any) => record?.objeto ?? record?.obj ?? record),
      },
    };
  }
}
