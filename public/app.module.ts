import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { LogInComponent }   from './loginApp/LoginApp.component';
import { FormsModule }   from '@angular/forms';
import {HttpModule} from '@angular/http';

@NgModule({
  imports:      [ BrowserModule, FormsModule, HttpModule ],
  declarations: [ LogInComponent ],
  bootstrap:    [ LogInComponent ]
})
export class AppModule { }