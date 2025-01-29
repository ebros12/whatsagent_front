import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';  // Importa HttpClient
import { Router } from '@angular/router';  // Para redirigir después de hacer login

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    CommonModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,  // Inyecta HttpClient
    private router: Router,    // Inyecta Router para redirigir
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],  // Campo de usuario con validación
      password: ['', [Validators.required]],  // Campo de contraseña con validación
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const loginData = this.loginForm.value;

      // Realiza la solicitud POST a NestJS (backend)
      this.http.post('http://localhost:3000/users/login', loginData).subscribe({
        next: (response: any) => {
          console.log('Login exitoso', response);
          // Almacena el token en localStorage (o lo que prefieras)
          localStorage.removeItem('user');

          localStorage.setItem('token', response.access_token);
          localStorage.setItem('user', JSON.stringify(response.user));
          
          // Redirige al usuario a la página de inicio
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.error('Error en login', err);
          alert('Credenciales incorrectas');
        }
      });
    }
  }
}
