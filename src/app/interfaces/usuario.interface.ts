export interface Usuario{
    id:number ,
    nombre:string,
    descripcion:string ,
    img:string ,
    id_perfil:number,
    nombre_perfil:string,
    change_pass?: number,
    key_registro:string,
    permisos : RecursoDetalle[]
}

export interface UsuarioLogeado {
    _result: string;
    llave_session: string;
    ID: number;
    Login: string;
    mail: string;
    Nombre1: string;
    Nombre2: string;
    Apellido1: string;
    Apellido2: string;
    nombreCompleto: string;
    estado: string;
    usr_registro: number;
    Fecha_Registro: string;
    Usr_Modif: number;
    Fecha_Modif: string;
    pass: string;
    change_pass: number;
    ultimo_ingreso: string;
    libranza: number;
    id_perfil: number;
    Perf_Nombre: string;
    descripcion: string;
    empleado: number;
    img: string;
    idPersona: number;
    permisos : RecursoDetalle[]
  }
  

export interface Perfil{
    id:number,
    Perf_Nombre:string,
    select:boolean
}

export interface Usuarios{
    ID:number;
    Login:string;
    Nombre1:string;
    Nombre2:string;
    Apellido1:string;
    Apellido2:string;
    nombreCompleto?:string;
    estado:number;
    usr_registro?:number;
    Fecha_Registro:string;
    Usr_Modif:number;
    Fecha_Modif:string;
    pass:string;
    change_pass:number;
    ultimo_ingreso:string; 
    descripcion?:string;
    perfil?:number;
    libranza?:boolean;
}

 

export interface RecursoDetalle{
    id?:number,
    nombre_recurso:string,
    display_nombre:string,
    img?:string,
    idtipo:number,
    tipo:string,
    estado?:number ,
    direccion?:string[] , 
    recursosHijos ?: RecursoDetalle[]
}
