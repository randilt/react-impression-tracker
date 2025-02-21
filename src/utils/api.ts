import { APIConfig, ImpressionData } from "../types";

export class APIManager {
  private config: APIConfig;
  private retryAttempts = 3;
  private retryDelay = 1000;

  constructor(config: APIConfig) {
    this.config = config;
  }

  async sendData(data: ImpressionData[]): Promise<void> {
    const formattedData = this.config.formatData
      ? this.config.formatData(data)
      : data;
    let attempts = 0;

    while (attempts < this.retryAttempts) {
      try {
        const response = await fetch(this.config.endpoint, {
          method: this.config.method || "POST",
          headers: {
            "Content-Type": "application/json",
            ...this.config.headers,
          },
          body: JSON.stringify(formattedData),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return;
      } catch (error) {
        attempts++;
        if (attempts === this.retryAttempts) {
          throw error;
        }
        await new Promise((resolve) =>
          setTimeout(resolve, this.retryDelay * attempts)
        );
      }
    }
  }
}
