import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {LoginComponent} from './login/login.component';
import {AppComponent} from './app.component';
import {InterceptorService} from './login/interceptor.service';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {ChatComponent} from './chat/chat.component';
import {LoginGuard} from './login/login.guard';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  }, {
    path: 'chat',
    component: ChatComponent,
    canActivate: [LoginGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
