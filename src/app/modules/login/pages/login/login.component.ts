import { Component, inject, OnInit } from '@angular/core';
import { LoginService } from 'src/app/services/login.services';
import { DatosInicialesService } from 'src/app/services/DatosIniciales.services';
import { Router } from '@angular/router'; 
import { vwsucursal } from 'src/app/models/app.db.interfaces';
import { Modal1Component } from 'src/app/modules/shared/components/modal1/modal1.component'
import { UsuarioModel } from 'src/app/models/usuario.model';
import {   NgForm } from '@angular/forms'; 
import { CustomConsole } from 'src/app/models/CustomConsole';
import Swal from 'sweetalert2'; 


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers:[Modal1Component]
})
export class LoginComponent implements OnInit { 
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
    

    login( form: NgForm){
   if(form.invalid){return;} 

    this._loginService.getLogin(this.usuario.Login , this.usuario.pass).subscribe(
      async (datos)=>{ 
        if(!datos?.usuario){ 
          Swal.fire('error de usuario')
        }else{
          CustomConsole.log('respuesta getLogin',datos.usuario);  
          localStorage.setItem('sis41254#2@', datos.usuario.key_registro );
          localStorage.setItem('#2@56YH7H82BF', `${datos.usuario.id}`); 
          const digestBuffer = await this._loginService.digestMessage(new Date().toDateString()); 
          localStorage.setItem('#2@JIEQPJKASFÑLKJ', digestBuffer);  
          localStorage.setItem(digestBuffer, datos.usuario.permisos.join()); 
          if (datos.usuario.change_pass ===  0 ){
            this._Router.navigate(['cambiarPass']);
          }else{
            console.log('llego aqui')
            this._Router.navigate(['home']);
          } 
        }
      
    } ,
    error => {
      CustomConsole.log(error) 
      Swal.fire('error', this._loginService.getErrorMessage(error) , 'error') 
    }
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
 

