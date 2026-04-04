import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { CntContablesService } from './cntContables.service';
import { ConfigService } from './config.service';

describe('CntContablesService', () => {
  let service: CntContablesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        CntContablesService,
        {
          provide: ConfigService,
          useValue: {
            url: {
              action: '/action',
              actionAdmin: '/action/admin',
              actionDocumentos: '/action/documentos'
            }
          }
        }
      ]
    });

    service = TestBed.inject(CntContablesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should unwrap manual operation from standard api response', () => {
    let actualResponse: any;

    service.setNewOperacion({
      nombre: 'Ajuste contable',
      descripcion: 'Prueba'
    } as any).subscribe((response) => {
      actualResponse = response;
    });

    const req = httpMock.expectOne('/action/admin');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.action).toBe('CREAR_OPERACION_MANUAL');

    req.flush({
      ok: true,
      data: {
        operationId: 9001,
        message: 'Operacion manual creada correctamente',
        operation: {
          nombre: 'Ajuste contable'
        }
      },
      error: null
    });

    expect(actualResponse.error).toBe('ok');
    expect(actualResponse.operationId).toBe(9001);
    expect(actualResponse.operation.nombre).toBe('Ajuste contable');
  });

  it('should unwrap executed transfer payload from standard api response', () => {
    let actualResponse: any;

    service.ejecutarTrasladosCuentas({
      nombre: 'Traslado principal',
      cuentas: []
    } as any).subscribe((response) => {
      actualResponse = response;
    });

    const req = httpMock.expectOne('/action/admin');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.action).toBe('EJECUTAR_OPERACIONES_PREESTABLECIDAS');

    req.flush({
      ok: true,
      data: {
        message: 'Operacion preestablecida ejecutada correctamente',
        objeto: {
          idOperacion: 8001,
          nombre: 'Traslado principal'
        }
      },
      error: null
    });

    expect(actualResponse.error).toBe('ok');
    expect(actualResponse.objeto.idOperacion).toBe(8001);
  });

  it('should extract backend error messages from standard error payload', () => {
    const message = service.getErrorMessage({
      error: {
        error: {
          code: 'ADMIN_OPERATION_ERROR',
          message: 'No existen cuentas para agregar a la tranferencia'
        }
      }
    });

    expect(message).toBe('No existen cuentas para agregar a la tranferencia');
  });
});
