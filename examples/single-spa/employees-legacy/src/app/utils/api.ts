import { combineLatest, from } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { Injectable } from '@angular/core';

// @ts-ignore
declare const System: any; // Provided globally by system.js

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private _initialized = false;
  private Api: any;
  private apiReadyPromise: Promise<void> | null = null;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize the external API module via SystemJS and set a readiness promise.
   */
  initialize() {
    if (!this.apiReadyPromise) {
      if (typeof System !== 'undefined' && typeof System.import === 'function') {
        // @ts-ignore
        this.apiReadyPromise = System.import('@mf-single-spa-demo/api')
          .then((api) => {
            // @ts-ignore
            this.Api = api;
            console.log('Angular API initialized', this.Api);
            this._initialized = true;
          })
          .catch((err: any) => {
            this._initialized = false;
            const message = '[SystemInitializer] Failed to load @mf-single-spa-demo/api';
            console.error(message, err);
            throw new Error(message);
          });

        console.log('[SystemInitializer] SystemJS initialized successfully.');
      } else {
        const message = '[SystemInitializer] SystemJS not detected on window.';
        console.warn(message);
        this.apiReadyPromise = Promise.reject(new Error(message));
      }
    }
  }

  /**
   * Wait for the API module to be ready, with a timeout to surface errors.
   */
  private waitForApi(timeoutMs = 15000): Promise<void> {
    if (!this.apiReadyPromise) {
      this.initialize();
    }
    const ready = this.apiReadyPromise as Promise<void>;

    // Timeout promise to reject if API never becomes ready
    const timeout = new Promise<void>((_, reject) => {
      const id = setTimeout(() => {
        clearTimeout(id);
        reject(new Error('[ApiService] API not initialized within timeout.'));
      }, timeoutMs);
    });

    return Promise.race([ready, timeout]);
  }

  getEmployees(pageNum = 1) {
    return from(this.waitForApi()).pipe(
      mergeMap(() => this.Api.fetchWithCache(`employees?page=${pageNum}`))
    );
  }

  getEmployee(idOrCode: string | number) {
    return from(this.waitForApi()).pipe(
      mergeMap(() => {
        const str = String(idOrCode);
        const isNumeric = /^[0-9]+$/.test(str);
        const url = isNumeric ? `employees/${str}/` : `employees?code=${encodeURIComponent(str)}`;
        return this.Api.fetchWithCache(url);
      })
    );
  }

  getPerson(peronNumber) {
    return from(this.waitForApi()).pipe(
      mergeMap(() => this.Api.fetchWithCache(`people/${peronNumber}/`))
    );
  }

  getPeopleByIds(people = []) {
    return from(this.waitForApi()).pipe(
      mergeMap(() => {
        const peopleObsArray = people.map((person) => {
          return this.Api.fetchWithCache(`people/${person}/`);
        });
        return combineLatest(peopleObsArray);
      })
    );
  }
}
