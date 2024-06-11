import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { authService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { UserService } from '../../services/UserService';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  form: FormGroup;

  
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  authService = inject(authService);
  router = inject(Router);
  userservice = inject(UserService);
  constructor(

  )
  {
    this.form = this.fb.group(
    {
      name:['',Validators.required],
      email:['', [Validators.required,Validators.email]],
      password:['', [Validators.required,Validators.minLength(6)]],
      phone:[''],
      age:[''],
      
      confirmPassword:['',Validators.required]
    }, 
    { validator: this.passwordMatchValidator });
  }
  
  passwordMatchValidator(formGroup: FormGroup): { [key: string]: any } | null {
    const password = formGroup.get('password');
    const confirmPassword = formGroup.get('confirmPassword');

    return password && confirmPassword && password.value !== confirmPassword.value
      ? { 'passwordMismatch': true }
      : null;
  }
  
  errorMessage: string | null = null;
  onSubmitRegister():void
  {
    const passwordControl = this.form.get('password');
    const confirmPasswordControl = this.form.get('confirmPassword');

    if (passwordControl && confirmPasswordControl &&
        passwordControl.value && confirmPasswordControl.value &&
        passwordControl.value !== confirmPasswordControl.value) 
    {
      alert("Passwords do not match. Please make sure your passwords match");
    }
    else
    {
      const rawForm = this.form.getRawValue();
      this.authService
      .register(
        rawForm.name,
        rawForm.email,
        rawForm.password
      )
      .subscribe({ 
        next:(userId) => {
        this.userservice.addUser(
          userId,
          rawForm.email,
          rawForm.name,
          rawForm.phone,
          rawForm.age,
          rawForm.password,
          
        );
        this.router.navigateByUrl('/login');
    
        alert('Account created successfully!');
      },
      error: (err) => {
        this.errorMessage = err.code;
      },    
    });
   }
    
}

}