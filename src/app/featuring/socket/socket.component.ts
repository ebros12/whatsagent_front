import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { io, Socket } from 'socket.io-client';

@Component({
  selector: 'app-socket',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule],
  templateUrl: './socket.component.html',
  styleUrls: ['./socket.component.css']
})
export class SocketComponent implements OnInit, OnDestroy {
  private socket!: Socket;
  messages: { user: string; message: string; channel: string }[] = [];
  user = 'Usuario' + Math.floor(Math.random() * 100);
  message = '';
  currentChannel = 'general'; // Canal por defecto

  ngOnInit() {
    this.socket = io('http://localhost:3000', {
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('Conectado al servidor con ID:', this.socket.id);
    });

    // Recibir historial de mensajes al conectar
    this.socket.on('messageHistory', (history: { user: string; message: string; channel: string }[]) => {
      this.messages = history;
    });

    this.socket.on('message', (data: { user: string; message: string; channel: string }) => {
      // Verificar si el mensaje es parte del historial
      const exists = this.messages.some(msg => msg.user === data.user && msg.message === data.message);
      if (!exists) {
        console.log('Mensaje recibido:', data);
        this.messages.push(data);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Desconectado del servidor');
    });

    // Unirse al canal por defecto
    this.joinChannel(this.currentChannel);
  }

  // Unirse a un canal
  joinChannel(channel: string) {
    this.currentChannel = channel;
    this.socket.emit('joinChannel', channel);
  }

  // Enviar un mensaje
  sendMessage() {
    if (this.message.trim()) {
      this.socket.emit('message', { user: this.user, message: this.message, channel: this.currentChannel });
    }
  }

  ngOnDestroy() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
