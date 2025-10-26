/**
 * Aurinko Calendar API Integration
 * Docs: https://docs.aurinko.io/
 */

export interface AurinkoAccount {
  id: string;
  email: string;
  provider: 'Google' | 'Office365';
  accessToken?: string;
}

export interface AurinkoEvent {
  id: string;
  calendarId: string;
  title: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  status?: 'confirmed' | 'tentative' | 'cancelled';
  busy?: boolean;
}

class AurinkoClient {
  private baseUrl = 'https://api.aurinko.io/v1';
  private clientId: string;
  private clientSecret: string;

  constructor() {
    this.clientId = process.env.AURINKO_CLIENT_ID || '';
    this.clientSecret = process.env.AURINKO_CLIENT_SECRET || '';
  }

  /**
   * Get OAuth authorization URL
   */
  getAuthUrl(userId: string, provider: 'Google' | 'Office365'): string {
    const params = new URLSearchParams({
      clientId: this.clientId,
      serviceType: provider,
      scopes: 'Calendar.ReadWrite',
      responseType: 'code',
      returnUrl: `${process.env.NEXTAUTH_URL}/api/calendar/callback`,
      state: userId, // Pass user ID in state
    });

    return `https://api.aurinko.io/v1/auth/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCode(code: string): Promise<AurinkoAccount> {
    const response = await fetch(`${this.baseUrl}/auth/token/${code}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientId: this.clientId,
        clientSecret: this.clientSecret,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to exchange code: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      id: data.account,
      email: data.email,
      provider: data.serviceType,
      accessToken: data.accessToken,
    };
  }

  /**
   * Get events from a calendar
   */
  async getEvents(
    accountId: string,
    calendarId: string,
    startDate: Date,
    endDate: Date
  ): Promise<AurinkoEvent[]> {
    const params = new URLSearchParams({
      after: startDate.toISOString(),
      before: endDate.toISOString(),
    });

    const response = await fetch(
      `${this.baseUrl}/calendars/${calendarId}/events?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${accountId}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get events: ${response.statusText}`);
    }

    const data = await response.json();
    return data.records || [];
  }

  /**
   * Find events with specific title (e.g., availability blocks)
   */
  async findEventsByTitle(
    accountId: string,
    calendarId: string,
    titleMatch: string,
    startDate: Date,
    endDate: Date
  ): Promise<AurinkoEvent[]> {
    const events = await this.getEvents(accountId, calendarId, startDate, endDate);
    return events.filter((event) =>
      event.title.toLowerCase().includes(titleMatch.toLowerCase())
    );
  }

  /**
   * Create a calendar event
   */
  async createEvent(
    accountId: string,
    calendarId: string,
    event: {
      title: string;
      description?: string;
      start: { dateTime: string; timeZone: string };
      end: { dateTime: string; timeZone: string };
      busy?: boolean;
    }
  ): Promise<AurinkoEvent> {
    const response = await fetch(
      `${this.baseUrl}/calendars/${calendarId}/events`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accountId}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create event: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Update a calendar event
   */
  async updateEvent(
    accountId: string,
    calendarId: string,
    eventId: string,
    updates: Partial<AurinkoEvent>
  ): Promise<AurinkoEvent> {
    const response = await fetch(
      `${this.baseUrl}/calendars/${calendarId}/events/${eventId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accountId}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update event: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Delete a calendar event
   */
  async deleteEvent(
    accountId: string,
    calendarId: string,
    eventId: string
  ): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/calendars/${calendarId}/events/${eventId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accountId}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete event: ${response.statusText}`);
    }
  }

  /**
   * Get list of calendars for an account
   */
  async getCalendars(accountId: string): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/calendars`, {
      headers: {
        Authorization: `Bearer ${accountId}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get calendars: ${response.statusText}`);
    }

    const data = await response.json();
    return data.records || [];
  }

  /**
   * Get primary calendar for an account
   */
  async getPrimaryCalendar(accountId: string): Promise<string> {
    const calendars = await this.getCalendars(accountId);
    const primary = calendars.find((cal) => cal.isPrimary);
    return primary?.id || calendars[0]?.id;
  }
}

export const aurinkoClient = new AurinkoClient();
