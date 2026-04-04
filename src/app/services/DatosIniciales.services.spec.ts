import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { DatosInicialesService } from './DatosIniciales.services';
import { ConfigService } from './config.service';

describe('DatosInicialesService', () => {
  let service: DatosInicialesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        DatosInicialesService,
        {
          provide: ConfigService,
          useValue: {
            url: {
              datosIniciales: '/datos-iniciales',
              httpOptionsSinAutorizacion: {
                headers: { 'Content-type': 'application/json' }
              }
            }
          }
        }
      ]
    });

    service = TestBed.inject(DatosInicialesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should unwrap principal branch data from standard api response', () => {
    let actualResponse: any;

    service.getDatosIniSucursal().subscribe((response) => {
      actualResponse = response;
    });

    const req = httpMock.expectOne('/datos-iniciales');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      action: 'GET_SUCURSAL_PRINCIPAL_DATA'
    });

    req.flush({
      ok: true,
      data: {
        branches: [
          { id_suc: 1, nombre_suc: 'Principal', descripcion: 'Sucursal principal' }
        ],
        count: 1
      },
      error: null
    });

    expect(actualResponse.length).toBe(1);
    expect(actualResponse[0].nombre_suc).toBe('Principal');
  });

  it('should extract backend error messages from standard error payload', () => {
    const message = service.getErrorMessage({
      error: {
        error: {
          code: 'DATOS_INICIALES_ERROR',
          message: 'No existen valores iniciales para consultar'
        }
      }
    });

    expect(message).toBe('No existen valores iniciales para consultar');
  });
});
