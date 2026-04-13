import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  { path: 'login', loadChildren: () => import('./pages/login/login.module').then(m => m.LoginModule) },
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadChildren: () => import('./pages/dashboard/dashboard.module').then(m => m.DashboardModule) },
      { path: 'candidates', loadChildren: () => import('./pages/candidates/candidates.module').then(m => m.CandidatesModule) },
      { path: 'vacancies', loadChildren: () => import('./pages/vacancies/vacancies.module').then(m => m.VacanciesModule) },
      { path: 'interviews', loadChildren: () => import('./pages/interviews/interviews.module').then(m => m.InterviewsModule) },
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
