import { Injectable } from '@nestjs/common';
import { EventServicePort, Event, SearchParams } from '../../core/domain/event';
import axios from 'axios';

@Injectable()
export class MeetupService implements EventServicePort {
  private readonly MEETUP_API_URL = 'https://api.meetup.com/gql';
  private readonly MEETUP_API_KEY = process.env.MEETUP_API_KEY; // API-Key aus .env

  async searchEvents(params: SearchParams): Promise<Event[]> {
    const query = `
      query ($query: String!, $location: String) {
        findEvents(query: $query, location: $location) {
          edges {
            node {
              id
              title
              dateTime
              venue {
                name
                lat
                lon
              }
              description
              eventUrl
              image {
                url
              }
              group {
                name
              }
            }
          }
        }
      }
    `;

    const variables = {
      query: params.query,
      location: params.location || 'global',
    };

    try {
      const response = await axios.post(
        this.MEETUP_API_URL,
        { query, variables },
        { headers: { Authorization: `Bearer ${this.MEETUP_API_KEY}` } },
      );

      const eventsData = response.data.data.findEvents.edges || [];

      return eventsData.map((edge: any) => {
        const event = edge.node;
        return {
          id: event.id,
          name: event.title,
          date: event.dateTime,
          location: event.venue ? event.venue.name : 'Online',
          latitude: event.venue?.lat,
          longitude: event.venue?.lon,
          description: event.description || 'No description available',
          imageUrl: event.image?.url,
          category: event.group?.name,
          ticketUrl: event.eventUrl,
        };
      });
    } catch (error) {
      console.error('Error fetching events from Meetup:', error);
      return [];
    }
  }
}
