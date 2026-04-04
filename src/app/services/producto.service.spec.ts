import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ProductoService } from './producto.service';
import { ConfigService } from './config.service';
import { loading } from '../models/app.loading';

describe('ProductoService', () => {
  let service: ProductoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ProductoService,
        loading,
        {
          provide: ConfigService,
          useValue: {
            url: {
              action: '/api/',
              httpOptionsSinAutorizacion: {
                headers: { 'Content-type': 'application/json' }
              }
            }
          }
        }
      ]
    });

    service = TestBed.inject(ProductoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should unwrap inventory products from standard api response', () => {
    let actualResponse: any;

    service.getProductosGeneral([0, 10]).subscribe((response) => {
      actualResponse = response;
    });

    const req = httpMock.expectOne('/api/inventario/');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      action: 'BUSCAR_TODOS_LOS_PRODUCTOS',
      _limit: [0, 10]
    });

    req.flush({
      ok: true,
      data: {
        products: [
          { id: 101, nombre: 'Shampoo Premium', barcode: '770101', precios: [], existencias: [] }
        ],
        count: 1,
        query: 'sample_products'
      },
      error: null
    });

    expect(actualResponse.error).toBe('ok');
    expect(actualResponse.numdata).toBe(1);
    expect(actualResponse.data[0].nombre).toBe('Shampoo Premium');
    expect(actualResponse.producto.id).toBe(101);
  });

  it('should unwrap inventory precargue response from standard api response', () => {
    let actualResponse: any;

    service.guardarNuevoProductoPrecargue({
      idProducto: 101,
      cantidad: 2,
      bodega: { id: 1, nombre: 'Principal' }
    } as any).subscribe((response) => {
      actualResponse = response;
    });

    const req = httpMock.expectOne('/api/inventario/');
    expect(req.request.body.action).toBe('INGRESO_DATOS_DATOS_AUX_INVENTARIO');

    req.flush({
      ok: true,
      data: {
        message: 'Precargue guardado correctamente',
        status: 'GUARDADO',
        ingressId: 0,
        warehouseId: 1,
        items: [{ id: 1, idProducto: 101 }],
        count: 1,
        performedAt: '2026-04-04 15:00:00',
        user: 'admin'
      },
      error: null
    });

    expect(actualResponse.error).toBe('ok');
    expect(actualResponse.numdata).toBe(1);
    expect(actualResponse.datos[0].idProducto).toBe(101);
    expect(actualResponse.estado).toBe('GUARDADO');
  });

  it('should extract backend error messages from standard error payload', () => {
    const message = service.getErrorMessage({
      error: {
        error: {
          code: 'BUSCAR_TODOS_LOS_PRODUCTOS_ERROR',
          message: 'No existen datos en la busqueda'
        }
      }
    });

    expect(message).toBe('No existen datos en la busqueda');
  });
});
