import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule }   from '@angular/forms';
import { HttpModule} from '@angular/http';

import { LogInComponent }   from './loginApp/LoginApp.component';
/*import { RegisterComponent} from './RegisterApp/registerApp.component';
import { NotFound} from './NotFound/NotFound.component';*/


@NgModule({
  imports:      [ BrowserModule, FormsModule, HttpModule ],
  declarations: [ LogInComponent ],
  bootstrap:    [ LogInComponent ]
})
export class AppModule { }