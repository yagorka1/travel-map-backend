import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

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

  // GeoJSON as text
  @Column({ type: 'jsonb' })
  geometry: any;

  @Column({ type: 'float' })
  distance: number; // meters

  @Column({ type: 'int' })
  pointsEarned: number;

  @Column({ type: 'varchar', length: 7, default: '#3B82F6' })
color: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @CreateDateColumn()
  createdAt: Date;
}