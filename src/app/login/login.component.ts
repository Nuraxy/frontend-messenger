import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {catchError, first} from 'rxjs/operators';
import {EMPTY} from 'rxjs';
import {Router} from '@angular/router';
import {LoginService} from './login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  form!: FormGroup;

  constructor(private formBuilder: FormBuilder,
              private router: Router,
              private loginService: LoginService) {
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group(
      {
        username: ['', Validators.required],
        password: ['', Validators.required]
      }
    );
  }

  public get formContent(): { [p: string]: AbstractControl } {
    return this.form.controls;
  }

  onSubmit(): void {
    console.log(this.form.value);
    if (this.form.invalid) {
      return;
    }
    this.subscribe();
  }

  private subscribe(): void {
    this.loginService.login(
      this.formContent.username.value,
      this.formContent.password.value
    ).pipe(first(),
      catchError(
        error => {
          console.log(error);
          return EMPTY;
        }
      ))
      .subscribe(() => {
        const userId = this.loginService.currentTokenValue.user.userId;
        this.router.navigateByUrl(`/chat`);
      });
  }

  navigate(): void {
    this.router.navigateByUrl(`/chat`);
  }

}
