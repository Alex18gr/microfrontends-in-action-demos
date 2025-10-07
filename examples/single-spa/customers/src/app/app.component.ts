import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Observable} from 'rxjs';
import {ApiService} from './service/api';

@Component({
    selector: 'view-dogs-root',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {


    // Stream of paged customers: { results: Customer[], next: boolean }
    customers$!: Observable<any>;

    constructor(private api: ApiService) {
        this.customers$ = this.api.getCustomers(1);
    }
}
