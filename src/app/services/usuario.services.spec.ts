import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { usuarioService } from './usuario.services';
import { ConfigService } from './config.service';
import { loading } from '../models/app.loading';

describe('usuarioService', () => {
  let service: usuarioService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        usuarioService,
        {
          provide: ConfigService,
          useValue: {
            url: {
              action: '/action',
              actionAdmin: '/action/admin'
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

    service = TestBed.inject(usuarioService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should unwrap resources from standard api response', () => {
    let actualResponse: any;

    service.getArrayRecursos().subscribe((response) => {
      actualResponse = response;
    });

    const req = httpMock.expectOne('/action/admin');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      action: 'GET_ALL_RECURSOS'
    });

    req.flush({
      ok: true,
      data: {
        resources: [
          { id: 1, display_nombre: 'Dashboard', recursosHijos: [] }
        ],
        count: 1
      },
      error: null
    });

    expect(actualResponse.error).toBe('ok');
    expect(actualResponse.numdata).toBe(1);
    expect(actualResponse.data[0].display_nombre).toBe('Dashboard');
  });

  it('should unwrap created user from standard api response', () => {
    let actualResponse: any;

    service.guardarUsuarios({
      ID: undefined,
      idPersona: 25,
      Login: 'jdominguez',
      Nombre1: 'Junior',
      Apellido1: 'Dominguez',
      email: 'junior@example.com',
      estado: 1,
      libranza: 0,
      nombreCompleto: 'Junior Dominguez',
      usr_registro: 10
    } as any).subscribe((response) => {
      actualResponse = response;
    });

    const req = httpMock.expectOne('/action/admin');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.action).toBe('CREAR_USUARIO');

    req.flush({
      ok: true,
      data: {
        usuarioID: 1025,
        message: 'Usuario creado correctamente',
        usuario: {
          ID: 1025,
          Login: 'jdominguez',
          Nombre: 'Junior Dominguez',
          email: 'junior@example.com',
          estado: 1,
          libranza: 0,
          idPersona: 25
        }
      },
      error: null
    });

    expect(actualResponse.error).toBe('ok');
    expect(actualResponse.usuarioID).toBe(1025);
    expect(actualResponse.data[0].Login).toBe('jdominguez');
  });

  it('should extract backend error messages from standard error payload', () => {
    const message = service.getErrorMessage({
      error: {
        error: {
          code: 'ADMIN_ERROR',
          message: 'Perfil invalido'
        }
      }
    });

    expect(message).toBe('Perfil invalido');
  });

  it('should unwrap profile assignment from standard api response', () => {
    let actualResponse: any;

    service.guardarUsuarioPerfil({ ID: 25 } as any, 3).subscribe((response) => {
      actualResponse = response;
    });

    const req = httpMock.expectOne('/action');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      action: 'INSERT_PERFIL_USUARIO',
      _parametro: {
        perfil: 3,
        usuario: 25
      }
    });

    req.flush({
      ok: true,
      data: {
        message: 'Perfil asignado correctamente',
        result: {
          _result: 100
        }
      },
      error: null
    });

    expect(actualResponse.message).toBe('Perfil asignado correctamente');
    expect(actualResponse.result._result).toBe(100);
  });
});
