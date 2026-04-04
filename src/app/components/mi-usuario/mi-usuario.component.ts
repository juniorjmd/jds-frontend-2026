import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { error } from 'jquery';
import { Usuario, UsuarioLogeado } from 'src/app/interfaces/usuario.interface';
import { LoginService } from 'src/app/services/login.services';
import { usuarioService } from 'src/app/services/usuario.services';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-mi-usuario',
  templateUrl: './mi-usuario.component.html',
  styleUrls: ['./mi-usuario.component.css']
})
export class MiUsuarioComponent implements OnInit {

  usuario?:UsuarioLogeado
  newPassword: string = '';
  confirmPassword: string = '';
  passwordError: string = '';
  constructor( private _ServLogin:LoginService, 
      private _Router : Router ) { }


  changePassword() {
    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = 'Las contraseñas no coinciden.';
      return;
    }

    const passwordPattern = /^(?=.*[A-Z])(?=.*\d).+$/;
    if (!passwordPattern.test(this.newPassword)) {
      this.passwordError = 'La contraseña debe tener al menos una mayúscula y un número.';
      return;
    }

    this.passwordError = '';
    // Lógica para cambiar la contraseña
    this._ServLogin.SET_PASS_USUARIO(this.usuario?.ID! , this.newPassword).subscribe(
      {
        next:(val)=>{
          console.log(val);
          Swal.fire('Contraseña cambiada exitosamente').then(() => {
            this._Router.navigate(['']); // Redirige cuando se cierra el modal
          });
          
        },error: e=> Swal.fire(this._ServLogin.getErrorMessage(e))
        
      }
    ) 


  }
  ngOnInit(): void {
    this._ServLogin.getDatosUsuarioLogeado().subscribe({next:(datos)=>{
     
      this.usuario = datos.usuario;   
     // this.usuarioService.changeUsuario(this.usuario); // Actualiza con el usuario logueado
  console.log(this.usuario);
  
      },error: (error: any) => { 
        Swal.fire(this._ServLogin.getErrorMessage(error)) 
    }})  
  }

}
