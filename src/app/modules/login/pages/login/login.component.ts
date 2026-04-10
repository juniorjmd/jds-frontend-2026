import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import Swal from 'sweetalert2';

import { LoginService } from 'src/app/services/login.services';
import { DatosInicialesService } from 'src/app/services/DatosIniciales.services';
import { vwsucursal } from 'src/app/models/app.db.interfaces';
import { Modal1Component } from 'src/app/modules/shared/components/modal1/modal1.component';
import { UsuarioModel } from 'src/app/models/usuario.model';
import { CustomConsole } from 'src/app/models/CustomConsole';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [Modal1Component]
})
export class LoginComponent implements OnInit {
  usuario!: UsuarioModel;
  sucursal: vwsucursal[] = [];

  isLoading = false;
  showPassword = false;
  anioActual = new Date().getFullYear();

  constructor(
    private _datosInicialesService: DatosInicialesService,
    private _loginService: LoginService,
    private _Router: Router
  ) {}

  get sucursalActual(): vwsucursal | undefined {
    return this.sucursal?.[0];
  }

  ngOnInit(): void {
    this.usuario = new UsuarioModel(undefined);
    this.getDatosInciales();
  }

  getDatosInciales(): void {
    this._datosInicialesService.getDatosIniSucursal().subscribe({
      next: (data: any) => {
        this.sucursal = Array.isArray(data) ? data : [];

        if (this.sucursal.length > 0) {
          this._datosInicialesService.chageSucursal(this.sucursal[0]);
        }
      },
      error: (error) => {
        CustomConsole.log('error retornado', error);
        Swal.fire(
          '_datosInicialesService - error',
          this._datosInicialesService.getErrorMessage(error),
          'error'
        );
      }
    });
  }

  async login(form: NgForm): Promise<void> {
    if (form.invalid || this.isLoading) {
      return;
    }

    this.isLoading = true;

    this._loginService.getLogin(this.usuario.Login, this.usuario.pass).subscribe({
      next: async (datos) => {
        try {
          if (!datos?.usuario) {
            Swal.fire('Error', 'Usuario o contraseña inválidos.', 'error');
            this.isLoading = false;
            return;
          }

          CustomConsole.log('respuesta getLogin', datos.usuario);

          localStorage.setItem('sis41254#2@', datos.usuario.key_registro);
          localStorage.setItem('#2@56YH7H82BF', `${datos.usuario.id}`);

          const digestBuffer = await this._loginService.digestMessage(new Date().toDateString());
          localStorage.setItem('#2@JIEQPJKASFÑLKJ', digestBuffer);
          localStorage.setItem(digestBuffer, datos.usuario.permisos.join());

          this.isLoading = false;

          if (datos.usuario.change_pass === 0) {
            this._Router.navigate(['cambiarPass']);
          } else {
            this._Router.navigate(['home']);
          }
        } catch (error) {
          this.isLoading = false;
          CustomConsole.log('error procesando login', error);
          Swal.fire('Error', 'No fue posible completar el inicio de sesión.', 'error');
        }
      },
      error: (error) => {
        this.isLoading = false;
        CustomConsole.log(error);
        Swal.fire('Error', this._loginService.getErrorMessage(error), 'error');
      }
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}
