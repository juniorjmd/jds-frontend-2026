import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core'; 
import { CustomConsole } from 'src/app/models/CustomConsole';
import { UsuarioConVentaModel } from 'src/app/models/usuario.model';
import { DatosInicialesService } from 'src/app/services/DatosIniciales.services';
import { ApiResponse } from 'src/app/interfaces/api-response.interface';
import { GenericRecordsPayload } from 'src/app/interfaces/generic-response.interface';

@Component({
  selector: 'elemt-usuarioDropdown',
  templateUrl: './usuario-dropdown.component.html',
  styleUrls: ['./usuario-dropdown.component.css']
})
export class usuarioDropdownComponent implements OnInit{

   options: UsuarioConVentaModel[] = [];
   @Input() selectedValue: UsuarioConVentaModel| null = null;
   @Input() conVentas: boolean  = false;
  @Output() selectionChange: EventEmitter<UsuarioConVentaModel> = new EventEmitter(); 
  @Output() clickBtnRefress: EventEmitter<void> = new EventEmitter(); // Even
  vueltas :boolean =  false;
  private inicioService= inject(DatosInicialesService) ;
  
  ngOnInit(): void { 
    CustomConsole.log('opciones : ',this.options);
   
   if(!this.conVentas){
    this.inicioService.getUsuarios().subscribe(vendedores => {
      if (vendedores.ok && vendedores.data.count > 0) {
        // Aquí puedes trabajar con el array de vendedores
        CustomConsole.log('Vendedores actualizados:', vendedores);
        this.options = vendedores.data.records;
      }
    });
  }else{

      
      this.inicioService.getUsuariosConVentas().subscribe(vendedores => {
        if (vendedores.ok && vendedores.data.count > 0) {
          // Aquí puedes trabajar con el array de vendedores
          CustomConsole.log('Vendedores actualizados:', vendedores);
          this.options = vendedores.data.records;
        }
      });
    }



  } 

  selectOption(option: UsuarioConVentaModel) {
    this.selectedValue = option;
    this.selectionChange.emit({...this.selectedValue}); 
  }
  triggerExternalFunction() {
    this.clickBtnRefress.emit(); // Emitir el evento
  }
}
