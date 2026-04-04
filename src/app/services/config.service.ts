import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { syncAppDbRuntime } from '../models/app.db.url';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private configUrl = 'assets/config.json';
  public config: any;
  public url: any;
  public enviroment!: string;
  public printer: any;

  constructor(private http: HttpClient) {}

  loadConfig(): Promise<any> {
    return firstValueFrom(this.http.get<any>(this.configUrl))
      .then(config => {
        this.config = config;
        const baseURL = config.baseURL;
        const endpoints = config.endpoints;

        // Construir las URLs a partir del archivo de configuración
        this.url = { 
          'httpOptionsSinAutorizacion': {
            headers: { 'Content-type': 'application/json' }
          },
          'action':  baseURL + endpoints.action,
          'actionDocumentos': baseURL + endpoints.actionDocumentos,
          'actionAdmin': baseURL + endpoints.admin,
          'actionVentas': baseURL + endpoints.actionVentas,
          'brand': baseURL + endpoints.brand,
          'datosIniciales': baseURL + endpoints.datosIniciales,
          'login': baseURL + endpoints.login,
          'inventario': baseURL + endpoints.inventario,
          'csv_manager': baseURL + endpoints.csv_manager
        };

        this.printer = config.printer;
        this.enviroment = config.enviroment;
        syncAppDbRuntime(config);

        console.log('Configuración cargada:', this.url, this.enviroment);
      })
      .catch((error: any) => {
        console.error('Error al cargar la configuración', error);
        return Promise.resolve(); // Maneja el error según tus necesidades
      });
  }
}
