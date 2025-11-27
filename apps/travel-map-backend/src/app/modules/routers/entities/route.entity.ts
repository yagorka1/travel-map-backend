import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { DEFAULT_ROUTE_COLOR } from '../constants/route.constants';
import { GeoJsonGeometry } from '../types/route.types';

@Entity('routes')
export class Route {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  /**
   * GeoJSON LineString geometry representing the route path.
   * Stored as JSONB for efficient querying and indexing.
   */
  @Column({ type: 'jsonb' })
  geometry: GeoJsonGeometry;

  /** Distance in meters */
  @Column({ type: 'float' })
  distance: number;

  /** Points earned for this route based on visited locations */
  @Column({ type: 'int' })
  pointsEarned: number;

  /** Hex color code for displaying the route on a map */
  @Column({ type: 'varchar', length: 7, default: DEFAULT_ROUTE_COLOR })
  color: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  /** List of countries visited during this route */
  @Column({ type: 'text', array: true, default: [] })
  countries: string[];

  /** List of cities visited during this route */
  @Column({ type: 'text', array: true, default: [] })
  cities: string[];

  @CreateDateColumn()
  createdAt: Date;
}

