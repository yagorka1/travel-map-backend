import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('levels')
export class Level {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'int' })
  minPoints: number;

  @Column({ type: 'int' })
  levelNumber: number;

  @Column({ nullable: true })
  description: string;
}
