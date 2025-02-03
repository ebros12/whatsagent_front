import { Component } from '@angular/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TemplateRef, ViewChild } from '@angular/core';
import { io } from 'socket.io-client';
import { trigger, transition, style, animate } from '@angular/animations';
@Component({
  selector: 'app-home',
  animations: [
    trigger('transitionMessages', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('500ms', style({ opacity: 0 }))
      ])
    ])
  ],
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [
    MatGridListModule,
    MatButtonModule,
    MatListModule,
    MatInputModule,
    MatIconModule,
    HttpClientModule,
    CommonModule,
    FormsModule,
    MatDialogModule,  
    NgFor, NgIf,
    
  ],
})
export class HomeComponent {
  usuario: string = ''; 
  tipoUsuario: string = ''; 
  mensajes: any[] = [];
  conversaciones: any[] = [];
  cargando: boolean = true;
  error: string | null = null;
  idUser: number | null = null;
  mensajesConversacionSeleccionada: any[] = [];
  nuevoMensaje: string = '';
  currentConversationId: number | null = null;
  userIP: string = ''; // Guardar la IP del usuario

  nombre: string = '';
  text: string = '';
  status: string = 'abierta';
  agentId: number | null = null;

  recibido_chat = new Audio('assets/notificacion_chat.mp3'); // Ruta del sonido en la carpeta assets
  enviado_chat = new Audio('assets/enviado_chat.mp3'); // Ruta del sonido en la carpeta assets


  mensajesSockets: { user: number; message: string; channel: string }[] = [];

  @ViewChild('crearMensajeModal', { static: true }) modalTemplate!: TemplateRef<any>;

  private socket = io('http://localhost:3000'); // Conectar con el backend

  constructor(
    private http: HttpClient,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {

    const usuarioLocalStorage = localStorage.getItem('user');
    const usuarioData = JSON.parse(usuarioLocalStorage || '{}');
  
    this.usuario = usuarioData.name || 'Invitado';
    this.tipoUsuario = usuarioData.type_user || 'Cliente';
    this.idUser = usuarioData.id !== null && typeof usuarioData.id === 'number' ? usuarioData.id : 1;

    this.fetchConversaciones();

    // Recibir historial de mensajes al conectar
    this.socket.on('messageHistory', (history: { user: number; message: string; channel: string }[]) => {
      this.mensajesSockets = history;
    });
  

    this.socket.on('message', (data: { user: number; message: string; channel: string }) => {
      // Verificar si el mensaje es parte del historial
      const exists = this.mensajesSockets.some(msg => msg.user === data.user && msg.message === data.message);
      if (!exists) {
        console.log('Mensaje recibido:', data);
        this.mensajesSockets.push(data);
        this.recibido_chat.play().catch((err) => console.error('Error al reproducir audio:', err));
      }
    });
  }


  fetchConversaciones(): void {
    this.cargando = true;
    const url = `http://localhost:3000/conversations?id=${this.idUser}`;

    this.http.get<any>(url).subscribe({
      next: (data) => {
        this.cargando = false;
        this.conversaciones = Object.values(data);
        console.log(this.conversaciones,"dsadasdasdasdas")
        if (this.conversaciones.length > 0) {
          this.currentConversationId = this.conversaciones[0]?.id;
          if (this.currentConversationId) {
            this.cargarMensajesConversacion(this.currentConversationId);
          }
        }
      },
      error: (err) => {
        this.cargando = false;
        this.error = 'Error al cargar las conversaciones.';
        console.error(err);
      },
    });
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.enviarMensaje();
    }
  }
  

  cargarMensajesConversacion(conversationId: number): void {
    const url = `http://localhost:3000/conversations/${conversationId}/messages`;

    this.cargando = true;
    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        this.cargando = false;
        this.mensajesConversacionSeleccionada = data;
        console.log("mensajesConversacionSeleccionada", data);
    
        // Aquí verificamos si ya hay un historial cargado en el socket
        // Si es la primera vez, asignamos los mensajes de la base de datos a mensajesSockets
        this.mensajesSockets = data.map(msg => ({
          user: msg.senderId,
          message: msg.content,
          channel: msg.conversationId
        }));
    
        // Escuchar el historial de mensajes al conectar al socket
        this.socket.on('messageHistory', (history: { user: number; message: string; channel: string }[]) => {
          console.log("Historial recibido", history);
          
          // Agregar el historial al array de mensajesSockets
          history.forEach(msg => {
            // Verificamos si el mensaje no existe en mensajesSockets antes de agregarlo
            const exists = this.mensajesSockets.some(existingMsg => 
              existingMsg.user === msg.user && existingMsg.message === msg.message);
            
            if (!exists) {
              this.mensajesSockets.push(msg);

            }
          });
        });
      },
      error: (err) => {
        this.cargando = false;
        this.error = 'Error al cargar los mensajes.';
        console.error(err);
      },
    });
    
  }

  joinChannel(channel: string) {
    this.socket.emit('joinChannel', channel);
  }


  seleccionarConversacion(conversacion: any): void {
    if (conversacion?.id) {
      this.currentConversationId = conversacion.id;
      this.cargarMensajesConversacion(conversacion.id);
        
      // Unirse a un canal
      
      this.joinChannel(conversacion.id);
    

    }
  }

  enviarMensaje(): void {
    if (!this.nuevoMensaje.trim() || this.currentConversationId == null) return;

    const mensaje = {
      content: this.nuevoMensaje,
      senderId: this.idUser,
      conversationId: this.currentConversationId,
    };


    this.http.post(`http://localhost:3000/conversations/${this.currentConversationId}/messages`, mensaje)
      .subscribe({
        next: (data) => {
        
    
          this.socket.emit('message', { 
            user: this.idUser,
            message: this.nuevoMensaje,
            channel: this.currentConversationId
          })
          this.nuevoMensaje = '';
        
            
          this.enviado_chat.play().catch((err) => console.error('Error al reproducir audio:', err));

          

        },
        error: (err) => {
          console.error('Error al enviar el mensaje:', err);
        }
      });
  }

  openCrearMensajeModal(): void {
    this.dialog.open(this.modalTemplate, {
      width: '400px'
    });
  }

  crearConversacion(): void {
    const nuevaConversacion = {
      nombre: this.nombre,
      userId: this.idUser,
      text: this.text,
      status: this.status,
      agentId: this.agentId
    };

    this.http.post('http://localhost:3000/conversations', nuevaConversacion)
      .subscribe({
        next: (response) => {
          console.log('Conversación creada:', response);
          this.fetchConversaciones();
        },
        error: (error) => {
          console.error('Error al crear la conversación:', error);
        }
      });
  }

  logOff(): void {
    localStorage.removeItem('user');
    this.router.navigate(['/']);
  }

  asignarAgente(conversacion: any): void {
    if (this.tipoUsuario !== 'Agente' || conversacion.agentId) return;

    if (conversacion.id && this.idUser) {
      const updatedConversation = {
        conversationId: conversacion.id,
        agentId: this.idUser
      };

      this.http.put(`http://localhost:3000/conversations/${conversacion.id}`, updatedConversation)
        .subscribe({
          next: (data) => {
            this.fetchConversaciones();
          },
          error: (err) => {
            console.error('Error al asignar agente:', err);
          }
        });
    }
  }
}
