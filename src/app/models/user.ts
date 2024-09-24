export interface User {
    name: string;
    authenticated: boolean;
    principal: Principal;
    authorities: Authority[];
    details: SessionDetails;
}

export interface Principal {
    username: string;
    password: string;
    enabled: boolean;
    credentialsNonExpired: boolean;
    accountNonLocked: boolean;
    accountNonExpired: boolean;
    authorities: Authority[];
}

export interface Authority {
    authority: string;
}

export interface SessionDetails {
    remoteAddress: string;
    sessionId: string | null;
}