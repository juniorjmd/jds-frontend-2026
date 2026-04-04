import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { cajasServices } from './Cajas.services';
import { ConfigService } from './config.service';
import { loading } from '../models/app.loading';

describe('cajasServices', () => {
  let service: cajasServices;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        cajasServices,
        {
          provide: ConfigService,
          useValue: {
            url: {
              action: '/action',
              actionVentas: '/action/ventas'
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

    service = TestBed.inject(cajasServices);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem('sis41254#2@');
  });

  it('should unwrap open box data from standard api response', () => {
    let actualResponse: any;

    service.abrirCaja({ id: 5 } as any, 250000).subscribe((response) => {
      actualResponse = response;
    });

    const req = httpMock.expectOne('/action');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      action: 'ABRIR_CAJA_ACTIVA',
      _parametro: { idCaja: 5 },
      _valorIngresar: 250000
    });

    req.flush({
      ok: true,
      data: {
        message: 'Caja abierta correctamente',
        box: {
          caja_id: 5,
          usuario: 'Admin',
          estado: 'ABIERTA',
          fecha_hora_apertura: '2026-04-04 10:00:00',
          monto_inicial: 250000,
          motivo: ''
        }
      },
      error: null
    });

    expect(actualResponse.message).toBe('Caja abierta correctamente');
    expect(actualResponse.box.caja_id).toBe(5);
  });

  it('should unwrap box summary from standard api response', () => {
    let actualResponse: any;

    service.resumenCaja({ id: 3 } as any).subscribe((response) => {
      actualResponse = response;
    });

    const req = httpMock.expectOne('/action');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      action: 'OBTENER_RESUMEN_CAJA',
      _parametro: { idCaja: 3 }
    });

    req.flush({
      ok: true,
      data: {
        summary: {
          caja_id: 3,
          estado: 'ABIERTA',
          usuario: 'Admin',
          base: 500000,
          efectivo: 1300000,
          sub_total_venta: 2100840,
          total_iva: 399160,
          total_descuento: 0,
          total_venta: 2500000,
          pagos: 2500000,
          creditos: 350000,
          recaudos: 200000,
          total_gastos: 150000,
          id_cierre_total: 1,
          ingresoEfectivo: 1300000,
          recaudos_externos: 0
        }
      },
      error: null
    });

    expect(actualResponse.summary.caja_id).toBe(3);
    expect(actualResponse.summary.estado).toBe('ABIERTA');
  });

  it('should extract backend error messages from standard error payload', () => {
    const message = service.getErrorMessage({
      error: {
        error: {
          code: 'BOX_ERROR',
          message: 'Caja no disponible'
        }
      }
    });

    expect(message).toBe('Caja no disponible');
  });

  it('should unwrap boxes by user from standard api response', () => {
    let actualResponse: any;

    service.getCajasPorUsuario(8).subscribe((response) => {
      actualResponse = response;
    });

    const req = httpMock.expectOne('/action');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      action: 'mnbvcxzxcxcxasdfewq15616',
      _usuario: 8
    });

    req.flush({
      ok: true,
      data: {
        boxes: [
          { id: 1, nombre: 'Caja Principal', asignada: true }
        ],
        count: 1
      },
      error: null
    });

    expect(actualResponse.count).toBe(1);
    expect(actualResponse.boxes[0].nombre).toBe('Caja Principal');
    expect(actualResponse.boxes[0].asignada).toBeTrue();
  });

  it('should unwrap assigned boxes result from standard api response', () => {
    let actualResponse: any;

    service.setCajasAUsuarios(8, [1, 3]).subscribe((response) => {
      actualResponse = response;
    });

    const req = httpMock.expectOne('/action');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      action: 'qwer12356yhn7ujm8ik',
      _idUsuario: 8,
      _cajas: [1, 3]
    });

    req.flush({
      ok: true,
      data: {
        message: 'Cajas asignadas correctamente',
        assignedBoxIds: [1, 3],
        inserted: 2,
        deleted: 1
      },
      error: null
    });

    expect(actualResponse.message).toBe('Cajas asignadas correctamente');
    expect(actualResponse.assignedBoxIds).toEqual([1, 3]);
  });
});
