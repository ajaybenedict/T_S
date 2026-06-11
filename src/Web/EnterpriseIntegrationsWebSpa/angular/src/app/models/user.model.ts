/**
 * Permission scope received from IsAuthorized API for a specific application.
 */
export interface UserPermissionScope {
    applicationId: number;
    permissionIds: number[];
    region: string[];
    country: string[];
}

/**
 * IsAuthorized API response.
 */
export interface IsAuthorizedResponse {
    userPermissions: UserPermissionScope[];
}

export interface UserResponse {
    firstName: string;
    lastName: string;
    emailAddress: string;
    userKey: string;
    authJwtToken?: string;
    redirectUrl?: string;
}

export class User {
    firstName: string;
    lastName: string;
    emailAddress: string;
    userKey: string;
    authJwtToken?: string;
    redirectUrl?: string;

    constructor(init: UserResponse) {
        this.firstName = init.firstName;
        this.lastName = init.lastName;
        this.emailAddress = init.emailAddress;
        this.userKey = init.userKey;
        this.authJwtToken = init.authJwtToken;
        this.redirectUrl = init.redirectUrl;
    }
}
