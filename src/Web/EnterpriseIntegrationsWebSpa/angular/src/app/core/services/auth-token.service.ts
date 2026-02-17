import { Injectable } from '@angular/core';
import { enc } from "crypto-js";
import { encrypt, decrypt } from "crypto-js/aes";
import { authToknEncryptionKey } from '../config/ppc-app.config';

@Injectable({
  providedIn: 'root'
})
export class AuthTokenService {

  private tokenKey = 'Authtoken';

  setToken(token: string) {
    this.setSecureStorage(this.tokenKey, token);
  }

  getToken() {
    const value = localStorage.getItem(this.tokenKey);
    if(value) {           
      return this.getFromSecureStorage(value);
    }
    return null;
  }

  clearToken() {
    localStorage.removeItem(this.tokenKey);
  }

  private setSecureStorage(key: string, value: string) {
    const encValue = encrypt(value, authToknEncryptionKey).toString();
    localStorage.setItem(key, encValue);
  }

  private getFromSecureStorage(value:string) {
    const bytes = decrypt(value, authToknEncryptionKey);
    return bytes.toString(enc.Utf8);
  }
}
