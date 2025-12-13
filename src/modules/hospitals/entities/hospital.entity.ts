import { PatientRecord } from 'src/modules/records/entities/patient-record.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('hospitals')
export class Hospital {
  @PrimaryGeneratedColumn()
  identifier: number;

  @Column()
  name: string;

  @OneToMany(() => PatientRecord, (patientRecord) => patientRecord.patient)
  patientRecords: PatientRecord[];
}
