import { StorageConfig } from "../types";

export class StorageManager {
  private type: StorageConfig["type"];
  private expirationDays?: number;

  constructor(config: StorageConfig) {
    this.type = config.type;
    this.expirationDays = config.expirationDays;
  }

  private getCookieExpiration(): string {
    const date = new Date();
    date.setDate(date.getDate() + (this.expirationDays || 7));
    return date.toUTCString();
  }

  setItem(key: string, value: any): void {
    const stringValue = JSON.stringify(value);

    switch (this.type) {
      case "localStorage":
        localStorage.setItem(key, stringValue);
        break;
      case "sessionStorage":
        sessionStorage.setItem(key, stringValue);
        break;
      case "cookie":
        document.cookie = `${key}=${encodeURIComponent(
          stringValue
        )}; expires=${this.getCookieExpiration()}; path=/`;
        break;
    }
  }

  getItem(key: string): any {
    let value: string | null = null;

    switch (this.type) {
      case "localStorage":
        value = localStorage.getItem(key);
        break;
      case "sessionStorage":
        value = sessionStorage.getItem(key);
        break;
      case "cookie":
        const cookies = document.cookie.split(";");
        const cookie = cookies.find((c) => c.trim().startsWith(`${key}=`));
        value = cookie ? decodeURIComponent(cookie.split("=")[1]) : null;
        break;
    }

    try {
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  }
}
