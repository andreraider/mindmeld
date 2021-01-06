import { BrowserModule } from '@angular/platform-browser';
import {CUSTOM_ELEMENTS_SCHEMA, LOCALE_ID, NgModule} from '@angular/core';
import localeDe from '@angular/common/locales/de';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import {HttpClientModule} from '@angular/common/http';
import {registerLocaleData} from '@angular/common';
import {AlertModule} from './modules/alert/alert.module';
import {AuthenticationModule} from './modules/authentication/authentication.module';
import {StatisticsModule} from './modules/statistics/statistics.module';
import {SharedModule} from './modules/shared/shared.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent,
    PageNotFoundComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    AlertModule,
    AuthenticationModule,
    StatisticsModule,
    SharedModule,
    BrowserAnimationsModule,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  providers: [
    {
      provide: LOCALE_ID,
      useValue: 'de'
    }
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule {
  constructor() {
    registerLocaleData(localeDe);
  }
}
