import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { LoginService } from './login.services';
import { ConfigService } from './config.service';

describe('LoginService', () => {
  let service: LoginService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        LoginService,
        {
          provide: ConfigService,
          useValue: {
            url: {
              login: '/auth',
              httpOptionsSinAutorizacion: {
                headers: { 'Content-type': 'application/json' }
              }
            }
          }
        }
      ]
    });

    service = TestBed.inject(LoginService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem('sis41254#2@');
  });

  it('should unwrap login data from standard api response', () => {
    const expectedUser = {
      id: 1,
      nombre: 'Admin',
      descripcion: 'Administrador',
      img: 'avatar.png',
      id_perfil: 10,
      nombre_perfil: 'Admin',
      key_registro: 'token-1',
      permisos: [],
      change_pass: 0,
    };

    let actualResponse: any;

    service.getLogin('admin', 'secret').subscribe((response) => {
      actualResponse = response;
    });

    const req = httpMock.expectOne('/auth');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      action: 'ef2e1d89937fba9f888516293ab1e19e7ed789a5',
      _password: 'secret',
      _usuario: 'admin'
    });

    req.flush({
      ok: true,
      data: {
        _result: '100',
        usuario: expectedUser
      },
      error: null
    });

    expect(actualResponse).toEqual({
      _result: '100',
      usuario: expectedUser
    });
  });

  it('should unwrap session user data from standard api response', () => {
    localStorage.setItem('sis41254#2@', 'token-2');

    let actualResponse: any;

    service.getUsuarioLogeadoAsync().subscribe((response) => {
      actualResponse = response;
    });

    const req = httpMock.expectOne('/auth');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      action: '16770d92a6a82ee846f7ff23b4c8ad05b69fba03',
      _llaveSession: 'token-2',
      _invoker: ''
    });

    req.flush({
      ok: true,
      data: {
        usuario: {
          id: 1,
          nombre: 'Admin',
          descripcion: 'Administrador',
          img: 'avatar.png',
          id_perfil: 10,
          nombre_perfil: 'Admin',
          key_registro: 'token-2',
          permisos: []
        }
      },
      error: null
    });

    expect(actualResponse.usuario.key_registro).toBe('token-2');
    expect(actualResponse.usuario.nombre).toBe('Admin');
  });

  it('should extract backend error messages from standard error payload', () => {
    const message = service.getErrorMessage({
      error: {
        error: {
          code: 'AUTH_ERROR',
          message: 'Token invalido'
        }
      }
    });

    expect(message).toBe('Token invalido');
  });

  it('should support legacy string error payloads while migrating', () => {
    const message = service.getErrorMessage({
      error: {
        error: 'La llave de session no es valida'
      }
    });

    expect(message).toBe('La llave de session no es valida');
  });
});
