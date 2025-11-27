import { Injectable } from '@nestjs/common';
import axios from 'axios';
import {
    DEFAULT_GEOCODING_LANGUAGE,
    NOMINATIM_API_URL,
} from '../constants/geo.constants';
import {
    GeocodingResult,
    NominatimResponse,
} from '../types/route.types';

@Injectable()
export class GeoService {
  async reverseGeocode(lat: number, lng: number): Promise<GeocodingResult> {
    try {
      const res = await axios.get<NominatimResponse>(NOMINATIM_API_URL, {
        params: {
          lat,
          lon: lng,
          format: 'json',
          addressdetails: 1,
          'accept-language': DEFAULT_GEOCODING_LANGUAGE,
        },
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
      console.error('Geocode error:', e);
      return { country: null, city: null };
    }
  }
}
