import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { DocumentoService } from './documento.service';
import { ConfigService } from './config.service';
import { loading } from '../models/app.loading';

describe('DocumentoService', () => {
  let service: DocumentoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        DocumentoService,
        {
          provide: ConfigService,
          useValue: {
            url: {
              action: '/action',
              actionDocumentos: '/documentos'
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

    service = TestBed.inject(DocumentoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem('sis41254#2@');
  });

  it('should return standard documents by active box payload from backend', () => {
    let actualResponse: any;

    service.getDocumentosCaja().subscribe((response) => {
      actualResponse = response;
    });

    const req = httpMock.expectOne('/documentos');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      action: 'GET_DOCUMENTOS_USUARIO_ACTUAL_CAJA_ACTIVA'
    });

    req.flush({
      ok: true,
      data: {
        records: [{ orden: 99, estado: 1, idDocumentoFinal: 'FV-99' }],
        count: 1
      },
      error: null
    });

    expect(actualResponse.ok).toBeTrue();
    expect(actualResponse.data.count).toBe(1);
    expect(actualResponse.data.records[0].orden).toBe(99);
  });

  it('should return standard create document payload from backend', () => {
    let actualResponse: any;

    service.crearDocumento().subscribe((response) => {
      actualResponse = response;
    });

    const req = httpMock.expectOne('/documentos');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      action: 'CREAR_DOCUMENTO_POR_USUARIO'
    });

    req.flush({
      ok: true,
      data: {
        message: 'Documento creado correctamente',
        documentId: 123,
        records: [{ orden: 123, estado: 1 }],
        count: 1
      },
      error: null
    });

    expect(actualResponse.ok).toBeTrue();
    expect(actualResponse.data.documentId).toBe(123);
    expect(actualResponse.data.records[0].orden).toBe(123);
  });

  it('should extract backend error messages from standard error payload', () => {
    const message = service.getErrorMessage({
      error: {
        error: {
          code: 'DOCUMENTOS_ERROR',
          message: 'Documento no disponible'
        }
      }
    });

    expect(message).toBe('Documento no disponible');
  });
});
