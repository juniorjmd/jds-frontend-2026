import { Component, OnInit } from '@angular/core';
import { Globals } from 'src/globales';
import { Title } from '@angular/platform-browser';
import * as $ from 'jquery';
import { CustomConsole } from './models/CustomConsole';
import { ConfigService } from './services/config.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [ Globals ] 
})
export class AppComponent  implements OnInit {
  

  llaveIncio:string; 
  constructor(
    private globals: Globals,
    private titleService: Title,
    private configService: ConfigService
  ){ 
   // CustomConsole.setEnvironment('dev');  
    this.llaveIncio = '';
    this.titleService.setTitle('JDS - sofdla.com.co');  
  }
  ngOnInit() { 
    CustomConsole.setEnvironment(this.configService.enviroment);  
    CustomConsole.log(this.configService.enviroment); 
    CustomConsole.log(this.configService.url);  
  }
 
}
