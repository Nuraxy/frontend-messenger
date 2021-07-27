import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {LoginComponent} from './login/login.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {LoginService} from './login/login.service';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {InterceptorService} from './login/interceptor.service';
import { MessengerComponent } from './messenger/messenger.component';
import {NgSelectModule} from '@ng-select/ng-select';
import { ChatComponent } from './messenger/chat/chat.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MessengerComponent,
    ChatComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgSelectModule
  ],
  providers: [
    LoginService,
    {provide: HTTP_INTERCEPTORS, useClass: InterceptorService, multi: true}
  ],
  bootstrap: [AppComponent]
})

export class AppModule {
}
