import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { InterviewsComponent } from './interviews.component';

@NgModule({
  declarations: [],
  imports: [InterviewsComponent, CommonModule, FormsModule, RouterModule.forChild([{ path: '', component: InterviewsComponent }])]
})
export class InterviewsModule {}
