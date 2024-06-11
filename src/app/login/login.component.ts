import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { authService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  fb = inject(FormBuilder);
  http = inject(HttpClient);
  authService = inject(authService);
  router = inject(Router);

  form = this.fb.nonNullable.group({
    email:['',Validators.required],
    password:['',Validators.required]
  });

  errorMessage: string | null = null;
  onSubmitLogin():void{
    const rawForm = this.form.getRawValue();
    this.authService
    .login(
      rawForm.email,
      rawForm.password
    )
    .subscribe({ 
      next:() => {
      this.router.navigateByUrl('/home');
      alert("Login Successful");
    },
    error: (err) => {
      this.errorMessage = err.code;
    },    
  });
}
}
