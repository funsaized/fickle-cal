/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from "@angular/core";
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { User } from "../models";
import { UserService } from "../services";

@Injectable({ providedIn: 'root' })
export class HeroResolver implements Resolve<User | null> {
    constructor(private service: UserService) { }
    resolve(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<User | null> {
        return this.service.user$;
    }
} 