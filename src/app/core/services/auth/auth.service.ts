import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';
import { first, map, catchError, tap } from 'rxjs/operators';
import { Observable, throwError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private router: Router,
    private http: HttpClient
  ) { }

  getCurrentUserToken(): string {
    let currentUserToken = JSON.parse(localStorage.getItem(environment.env_key + 'currentUserToken'));
    if (currentUserToken) {
      return currentUserToken;
    }
    else {
      return null;
    }
  }

  getCurrentUserProfileId(): any {
    let currentProfileId = localStorage.getItem(environment.env_key + 'currentProfile');
    if (currentProfileId) {
      return currentProfileId;
    }
    else {
      return null;
    }
  }

  getCurrentUserInstitutionId(): any {
    let currentInstitutionId = localStorage.getItem(environment.env_key + 'currentInstitution');
    currentInstitutionId = JSON.parse(currentInstitutionId);

    if (currentInstitutionId) {
      return currentInstitutionId;
    }
    else {
      return null;
    }
  }

  getCurrentProfile() {
    let currentUser = this.getCurrentUserData();
    let currentInstitutionId = this.getCurrentUserInstitutionId();
    let currentProfileId = this.getCurrentUserProfileId();

    if (!currentUser)
      return null;

    let institutionProfiles = currentUser.institution_profile.find(
      (institutionProfile: any) => {
        return institutionProfile.institution.id == currentInstitutionId;
      }
    );

    let profiles = (institutionProfiles && institutionProfiles.profiles ? institutionProfiles.profiles : null);
    let profile = (profiles) ? profiles.find((profile) => profile.id == currentProfileId) : null;

    return profile;
  }


  getCurrentLocations(){
    let currentUser = this.getCurrentUserData();
    let currentInstitutionId = this.getCurrentUserInstitutionId();
    let currentUserProfileId = this.getCurrentUserProfileId();

    if (!currentUser)
      return null;

    let search = currentUser.institution_profile.find(
      (institutionProfile) => {
        return institutionProfile.institution.id == currentInstitutionId
      });
    console.log(search)
    search = search.profiles.find(
      (profiles) => {
        return profiles.id == currentUserProfileId
      });
    return (search) ? search.location : null;
  }


  getCurrentInstitution() {
    let currentUser = this.getCurrentUserData();
    let currentInstitutionId = this.getCurrentUserInstitutionId();

    if (!currentUser)
      return null;

    let search = currentUser.institution_profile.find(
      (institutionProfile) => {
        return institutionProfile.institution.id == currentInstitutionId
      });
    return (search && search.institution) ? search.institution : null;
  }


  getCurrentUserData(): any {
    return JSON.parse(localStorage.getItem(environment.env_key + 'currentMe'));
  }

  getUserCanAuthorize() {
    let aux = JSON.parse(localStorage.getItem(environment.env_key + 'currentMe'));
    if (aux)
      return aux.can_authorize_order;
    return false;
  }

  currentUserIsLogged(): boolean {
    if (this.getCurrentUserToken() != null) {
      return true;
    }
    return false;
  }

  currentProfileIsLogged(): boolean {
    if (this.currentUserIsLogged()) {
      if (this.getCurrentUserProfileId() != "none" && this.getCurrentUserProfileId() != null)
        return true;
    }
    return false;
  }

  getCurrentUser(): Observable<any> {
    return this.http.get<any>(`${environment.backend_url}/core/api/v1/users/me/`);
  }

  register(username: string, password: string, institution_id: number, profile_id: number) {

    //let trimmedEmail = email.trim();

    console.log("..Registrando paso1");
    return this.http.post<any>(`${environment.backend_url}/api/v1/users/`, { 'username': username, 'password': password, 'institution_id': institution_id, 'profile_id': profile_id })
      .pipe(map(serverResponse => {
        console.log("..Registrando paso2");
        if (serverResponse.status == true) {
          let data = serverResponse.data;
          if (data && data.token) {
            localStorage.setItem(environment.env_key + 'currentUserToken', JSON.stringify(data));
          }
          return serverResponse;
        }
        else {
          return serverResponse;
        }
      }),
        catchError(serverResponse => {
          return throwError(serverResponse.error.message);
        })
      );
  }

  saveUserData(data) {
    let profileId = "none";

    if (data) {
      localStorage.setItem(environment.env_key + 'currentProfile', profileId);
      localStorage.setItem(environment.env_key + 'currentMe', JSON.stringify(data));
    }
  }

  saveUserToken(data) {
    if (data && data.token) {
      localStorage.setItem(environment.env_key + 'currentUserToken', JSON.stringify(data));
      localStorage.setItem(environment.env_key + 'lastLoginTime', Date.now().toString());
    }

  }


  setCurrentUserProfileId(profileId: string) {
    localStorage.setItem(environment.env_key + 'currentProfile', profileId);
  }

  setCurrentUserInstitutionId(profileId: string) {
    localStorage.setItem(environment.env_key + 'currentInstitution', JSON.stringify(profileId));
    localStorage.setItem(environment.env_key + 'start_notification', "0");
  }

  login(username: string, password: string) {
    return this.http.post<any>(`${environment.backend_url}/login/`, { username, password });
  }

  logout() {
    localStorage.clear();
  }

  getUserCostCenter() {
    let userData = this.getCurrentLocations();
   return (userData as []).filter((x: any) => x.type.id == environment.LOCATION_TYPE_COST_CENTER);
  }

  getUserLocations() {
    let userData = this.getCurrentLocations();
    return (userData as []).filter((x: any) => x.type.id == environment.LOCATION_TYPE_DRUGSTORE || x.type.id == environment.LOCATION_TYPE_CELLAR);
  }
}