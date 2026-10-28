export interface NotificationAdapter {
  sendZns(phone: string, templateId: string): Promise<boolean>;
}

export class MockZnsAdapter implements NotificationAdapter {
  async sendZns(_phone: string, _templateId: string): Promise<boolean> {
    return true;
  }
}
