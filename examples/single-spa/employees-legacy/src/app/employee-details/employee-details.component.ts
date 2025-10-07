import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from '../utils/api';

@Component({
  selector: 'app-employee-details',
  templateUrl: './employee-details.component.html',
  styleUrls: ['./employee-details.component.css']
})
export class EmployeeDetailsComponent implements OnInit, OnDestroy {
  code: string | null = null;
  employee: any = null;
  loading = false;
  error: string | null = null;

  private sub: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    this.sub = this.route.paramMap.subscribe((params) => {
      this.code = params.get('code');
      if (this.code) {
        this.loadEmployeeByCode(this.code);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
      this.sub = null;
    }
  }

  goBack() {
    // Navigate back to list (relative)
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  private loadEmployeeByCode(code: string) {
    this.loading = true;
    this.error = null;

    const s = this.api.getEmployee(code).subscribe({
      next: (emp: any) => {
        if (emp && (emp.EmployeeNumber?.toString() === code)) {
          this.employee = emp;
          this.loading = false;
        } else {
          this.employee = null;
          this.loading = false;
          this.error = `Employee with code ${code} not found.`;
        }
        s.unsubscribe();
      },
      error: (err: any) => {
        console.error('Failed to load employee by code', err);
        this.loading = false;
        this.error = 'Failed to load employee details.';
        s.unsubscribe();
      }
    });
  }
}
