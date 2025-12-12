import { Injectable } from '@nestjs/common';
import axios from 'axios';
import {
    DEFAULT_GEOCODING_LANGUAGE,
    NOMINATIM_API_URL,
    NOMINATIM_REQUEST_DELAY_MS,
    NOMINATIM_USER_AGENT,
} from '../constants/geo.constants';
import {
    GeocodingResult,
    NominatimResponse,
} from '../types/route.types';

@Injectable()
export class GeoService {
  private lastRequestTime = 0;

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async rateLimitedRequest(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < NOMINATIM_REQUEST_DELAY_MS) {
      await this.sleep(NOMINATIM_REQUEST_DELAY_MS - timeSinceLastRequest);
    }
    
    this.lastRequestTime = Date.now();
  }

  async reverseGeocode(lat: number, lng: number): Promise<GeocodingResult> {
    try {
      await this.rateLimitedRequest();

      const res = await axios.get<NominatimResponse>(NOMINATIM_API_URL, {
        params: {
          lat,
          lon: lng,
          format: 'json',
          addressdetails: 1,
          'accept-language': DEFAULT_GEOCODING_LANGUAGE,
        },
        headers: {
          'User-Agent': NOMINATIM_USER_AGENT,
        },
        timeout: 10000,
      });

      return {
        country: res.data.address?.country || null,
        city:
          res.data.address?.city ||
          res.data.address?.town ||
          res.data.address?.village ||
          null,
      };
    } catch (e) {
      console.error('Geocode error:', e.message || e);
      
      if (axios.isAxiosError(e) && e.response?.status === 403) {
        throw new Error('Nominatim API access blocked. Please try again later.');
      }
      
      return { country: null, city: null };
    }
  }
}

