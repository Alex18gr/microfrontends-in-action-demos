import { Component, OnDestroy, OnInit } from '@angular/core';
import { ApiService } from '../utils/api';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css']
})
export class EmployeeListComponent implements OnInit, OnDestroy {
  employees: any[] = [];
  loading = false;
  error: string | null = null;
  private sub: Subscription | null = null;

  // Filters
  filterName: string = '';
  filterSurname: string = '';
  filterEmail: string = '';

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.sub = this.apiService.getEmployees(1).subscribe(
      (response: any) => {
        const data = response && response.results ? response.results : (Array.isArray(response) ? response : []);
        this.employees = data || [];
        this.loading = false;
        console.log('Employees loaded', this.employees);
      },
      (err: any) => {
        console.error('Error loading employees', err);
        this.error = 'Failed to load employees data.';
        this.loading = false;
      }
    );
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
      this.sub = null;
    }
  }

  get filteredEmployees(): any[] {
    const name = (this.filterName || '').trim().toLowerCase();
    const surname = (this.filterSurname || '').trim().toLowerCase();
    const email = (this.filterEmail || '').trim().toLowerCase();

    if (!name && !surname && !email) {
      return this.employees;
    }

    return this.employees.filter((emp) => {
      const n = (emp?.name ?? '').toString().toLowerCase();
      const s = (emp?.surname ?? '').toString().toLowerCase();
      const e = (emp?.email ?? '').toString().toLowerCase();
      const okName = !name || n.includes(name);
      const okSurname = !surname || s.includes(surname);
      const okEmail = !email || e.includes(email);
      return okName && okSurname && okEmail;
    });
  }

  goToDetails(emp: any) {
    const code = emp?.EmployeeNumber;
    if (code) {
      this.router.navigate([code], { relativeTo: this.route });
    }
  }

  trackById(_: number, item: any) {
    return item?.id ?? item?.EmployeeNumber ?? _;
  }
}
