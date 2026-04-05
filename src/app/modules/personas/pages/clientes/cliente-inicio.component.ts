import { Component, OnInit } from '@angular/core';

import { ClientesService, cliente } from 'src/app/services/Clientes.services';

import { loading } from 'src/app/models/app.loading';  
import { ClientesModel } from 'src/app/models/clientes/clientes.module';
import { FndClienteComponent } from '../../../shared/modals/fnd-cliente/fnd-cliente.component';
import { MatDialog } from '@angular/material/dialog';
import { tap } from 'rxjs';
import Swal from 'sweetalert2';
import { CustomConsole } from 'src/app/models/CustomConsole';
import { ApiResponse } from 'src/app/interfaces/api-response.interface';
import { GenericRecordsPayload } from 'src/app/interfaces/generic-response.interface';
@Component({
  selector: 'app-cliente-inicio',
  templateUrl: './cliente-inicio.component.html',
  styleUrls: ['./cliente-inicio.component.css']
})
export class ClienteInicioComponent implements OnInit {
  clientes:ClientesModel[] = [];
  constructor(public loading : loading, private ClienteService:ClientesService,   private newAbrirDialog: MatDialog,) { 
    this.getClientesOdoo() 

  
    

  }
  mostrarCliente(cliente:ClientesModel){
    CustomConsole.log('cliente enviado a editar' , cliente);
    
    this.newAbrirDialog.open(FndClienteComponent,{data: { clienteIngreso : cliente , invoker:'clienteListado' } })
    .afterClosed()
    .pipe(
      tap((confirmado: Boolean)=>{
        if (confirmado) {  
           
        }
      })
    ).subscribe({
      next: () => {},
      error: (error) => Swal.fire(JSON.stringify( error )),
      complete: () => CustomConsole.log('buscarCliente completo')
    }); 
  }
  ngOnInit(): void {
    this.ClienteService.currentUsuario.subscribe((usuario) => { let cliente = usuario ; 
      if(cliente)   this.getClientesOdoo();
    });
  }
  getClientesOdoo(){
    this.loading.show();
    this.ClienteService.getClientes().subscribe( {next:(respuesta:ApiResponse<GenericRecordsPayload<ClientesModel>>)=>{ 
      //  CustomConsole.log('cerrarDocumento',respuesta); 
       if (respuesta.ok){ 
        CustomConsole.log(respuesta);
        this.clientes = respuesta.data.records;  
       }else{
         alert(respuesta.error?.message || 'No fue posible consultar los clientes');
       }
},error:error=>{Swal.fire(JSON.stringify(error))} ,complete:()=> this.loading.hide()} )
  }
}
