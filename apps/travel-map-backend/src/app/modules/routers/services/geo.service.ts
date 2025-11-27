import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class GeoService {
  async reverseGeocode(lat: number, lng: number) {
    try {
      const res = await axios.get('https://nominatim.openstreetmap.org/reverse', {
        params: {
          lat,
          lon: lng,
          format: 'json',
          addressdetails: 1,
          'accept-language': 'en'
        }
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
      console.error("Geocode error:", e);
      return { country: null, city: null };
    }
  }
}
