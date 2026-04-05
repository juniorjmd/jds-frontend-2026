import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { VehiculosService } from './vehiculos.service';
import { ConfigService } from './config.service';
import { loading } from '../models/app.loading';

describe('VehiculosService', () => {
  let service: VehiculosService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        VehiculosService,
        {
          provide: ConfigService,
          useValue: {
            url: {
              action: '/action'
            }
          }
        },
        {
          provide: loading,
          useValue: {
            show: () => undefined,
            hide: () => undefined
          }
        }
      ]
    });

    service = TestBed.inject(VehiculosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should return insert select response for service costs using the standard api envelope', () => {
    let actualResponse: any;

    service.guardarCostoServicio({
      cod_servicio: 11,
      cod_tipo_vehiculo: 999999999,
      valor: 25000,
      estado: 1
    } as any).subscribe((response) => {
      actualResponse = response;
    });

    const req = httpMock.expectOne('/action');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.action).toBe('DATABASE_GENERIC_CONTRUCT_INSERT_SELECT');
    expect(req.request.body._tabla).toBe('vehiculos_servicios_costos');
    expect(req.request.body._tablaSelect).toBe('vehiculos_tipos');

    req.flush({
      ok: true,
      data: {
        message: 'Insercion realizada correctamente',
        affected: 4,
        deleted: 1
      },
      error: null
    });

    expect(actualResponse.ok).toBeTrue();
    expect(actualResponse.data.message).toBe('Insercion realizada correctamente');
    expect(actualResponse.data.affected).toBe(4);
    expect(actualResponse.data.deleted).toBe(1);
  });

  it('should extract backend error messages from standard error payload', () => {
    const message = service.getErrorMessage({
      error: {
        error: {
          code: 'VEHICULOS_ERROR',
          message: 'No fue posible guardar el costo'
        }
      }
    });

    expect(message).toBe('No fue posible guardar el costo');
  });
});
