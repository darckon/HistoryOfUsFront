import { Injectable, Inject } from "@angular/core";
import { Subject } from "rxjs";
import { map, filter } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

export class UserService {

    http:HttpClient = null;
    constructor( @Inject(HttpClient) http: HttpClient) { 
        this.http = http;
    }


    get(id: string)
    {
        return this.http.get(`${environment.backend_url}/core/api/v1/users/${id}`)
    }

    search(user: string) {

        let url: string = `${environment.backend_url}/core/api/v1/users/?search=${user}`;
        return this.http.get(url);
    }    

    update(data:any, id:string)
    {
        return this.http.patch(`${environment.backend_url}/core/api/v1/users/${id}/`,data)
    }

    getUsers(page: string,filters: any)
    {
        if(filters && filters.name)
            return this.http.get(`${environment.backend_url}/core/api/v1/users/?search=${filters.name}&page=${page}`)
        
        return this.http.get(`${environment.backend_url}/core/api/v1/users/?page=${page}`)
    }

    create(data:any)
    {
        return this.http.post(`${environment.backend_url}/core/api/v1/users/`,data)
    }

    getLocations(institution:string) {
        return this.http.get(`${environment.backend_url}/supplying/article/api/v1/locations/?location_type__name__in=Bodega,Farmacia&institution=${institution}`)
    }

    getLocationsCustom(institution:string) {
        return this.http.get(`${environment.backend_url}/supplying/article/api/v1/locations/?location_type__id__in=1,2,4&institution=${institution}&page_size=15`)
    }

    getCostCenters(institution:string) {
        return this.http.get(`${environment.backend_url}/core/api/v1/cost-center/?location_type__name__in=Bodega,Farmacia&institution=${institution}`)
      }
    
    getPersonTypes()
    {
        return this.http.get(`${environment.backend_url}/core/api/v1/persons-types`)
    }

    getUserProfiles(institution:string)
    {
        return this.http.get(`${environment.backend_url}/core/api/v1/profiles?institution=${institution}`)
    }


    getCommunes() {
        return this.http.get(`${environment.backend_url}/core/api/v1/communes/?page_size=300`)
    }

    getGenders() {
        return this.http.get(`${environment.backend_url}/core/api/v1/genders`)
    }

    getNationalities() {
        return this.http.get(`${environment.backend_url}/core/api/v1/nationalities?page_size=300`)
    }

}