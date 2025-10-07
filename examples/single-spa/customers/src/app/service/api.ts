import {Observable} from 'rxjs';
import {Injectable} from '@angular/core';
// @ts-ignore
import {fetchWithCache} from '@mf-single-spa-demo/api';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    constructor() {
    }

    getEmployees(pageNum = 1): Observable<any> {
        // @ts-ignore
        return fetchWithCache(`employees?page=${pageNum}`);
    }

    // Fetch a paginated list of customers
    getCustomers(pageNum = 1): Observable<any> {
        // @ts-ignore
        return fetchWithCache(`customers?page=${pageNum}`);
    }
}
