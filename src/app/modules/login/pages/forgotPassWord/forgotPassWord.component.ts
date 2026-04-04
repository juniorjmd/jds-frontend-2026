import {  Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { vwsucursal } from 'src/app/models/app.db.interfaces';
import { CustomConsole } from 'src/app/models/CustomConsole';
import { UsuarioModel } from 'src/app/models/usuario.model';
import { DatosInicialesService } from 'src/app/services/DatosIniciales.services';
import { LoginService } from 'src/app/services/login.services';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-forgot-pass-word',
  templateUrl: './forgotPassword.component.html',
  styleUrls: ['./forgotPassWord.component.css']  
})
export class ForgotPassWordComponent implements OnInit { 
  usuario!:UsuarioModel;
  sucursal:vwsucursal[]=[]; 
  constructor(private _datosInicialesService : DatosInicialesService,
    private _loginService: LoginService,
    private _Router : Router ) {

   }
getDatosInciales(){

  this._datosInicialesService.getDatosIniSucursal().subscribe({
    next: (data:any)=>{
      this.sucursal = data;
      this._datosInicialesService.chageSucursal(this.sucursal[0]) 
    } , error: error => {CustomConsole.log('error retornado',error)
      Swal.fire('_datosInicialesService - error', JSON.stringify(error) , 'error') 
    }
  } ); 
}
    

changePassword( form: NgForm){
   if(form.invalid){
    Swal.fire('error' , 'Debe ingresar un usuario valido!' , 'error')
    return;}  
    this._loginService.setRenovacionContrasena(this.usuario.Login).subscribe({next:
       (_datos)=>{ 
        console.log(_datos)
        Swal.fire({
          title: 'Cambio de contraseña completado',
          text: 'El sistema ha generado una nueva contraseña para el usuario suministrado. Esta información ha sido enviada al correo registrado.',
          icon: 'success'
        }).then(() => {
          this._Router.navigate(['']); // Redirige cuando se cierra el modal
        });
      
    } ,
    error:(error) => {
      CustomConsole.log(error) 
      Swal.fire('error', this._loginService.getErrorMessage(error) , 'error') 
    }}
  ); 
    
  }
   myFunction(x:any) { 
    if (x.type === "password") {
        x.type = "text";
    } else {
        x.type = "password";
    }
} 
ngOnInit(): void {
  this.usuario =  new UsuarioModel( undefined); 
  this.getDatosInciales();
  } 
}
 

