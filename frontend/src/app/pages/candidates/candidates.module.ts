import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CandidatesComponent } from './candidates.component';

@NgModule({
  declarations: [],
  imports: [CandidatesComponent, CommonModule, FormsModule, RouterModule.forChild([{ path: '', component: CandidatesComponent }])]
})
export class CandidatesModule {}
