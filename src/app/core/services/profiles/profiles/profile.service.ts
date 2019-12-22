import { Injectable, Inject } from "@angular/core";
import { Subject } from "rxjs";
import { map, filter } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class ProfileService {


    http: HttpClient = null;
    constructor(@Inject(HttpClient) http: HttpClient) {
        this.http = http;
    }

    get(id: string) {
        return this.http.get(`${environment.backend_url}/core/api/v1/profiles/${id}`)
    }

    create(data: any) {
        return this.http.post(`${environment.backend_url}/core/api/v1/profiles/`, data)
    }

    update(data: any, id: string) {
        return this.http.patch(`${environment.backend_url}/core/api/v1/profiles/${id}/`, data)
    }

    getProfiles(page: string, filters: any, institution: string) {
        if (filters && filters.name)
            return this.http.get(`${environment.backend_url}/core/api/v1/profiles/?search=${filters.name}&institution=${institution}&page=${page}`)

        return this.http.get(`${environment.backend_url}/core/api/v1/profiles/?page=${page}&institution=${institution}`)
    }

    getPrevilegies(institution: string) {
        return this.http.get(`${environment.backend_url}/core/api/v1/privileges/?institution=${institution}&page_size=300`)
    }

    getCategoryPrevilegies() {
        return this.http.get(`${environment.backend_url}/core/api/v1/privileges-category?no_page`)
    }

}
