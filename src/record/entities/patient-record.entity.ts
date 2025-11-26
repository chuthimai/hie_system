import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('patient-records')
export class PatientRecord {
  @PrimaryGeneratedColumn()
  identifier: number;
}
