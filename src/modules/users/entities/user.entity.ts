import { PatientRecord } from 'src/modules/records/entities/patient-record.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  identifier: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  telecom: string;

  @Column({ name: 'birth_date', type: 'date' })
  birthDate: string;

  @Column()
  gender: boolean;

  @Column()
  address: string;

  @OneToMany(() => PatientRecord, (patientRecord) => patientRecord.patient)
  patientRecords: PatientRecord[];
}
