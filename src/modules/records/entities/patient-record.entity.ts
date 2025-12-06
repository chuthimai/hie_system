import { Hospital } from 'src/modules/hospitals/entities/hospital.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('patient-records')
export class PatientRecord {
  @PrimaryGeneratedColumn()
  identifier: number;

  @Column()
  name: string;

  @Column()
  hash: string;

  @Column({ nullable: true })
  blockId: number;

  @Column({ nullable: true })
  transactionId: number;

  @Column({
    name: 'created_time',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdTime: string;

  @Column({ name: 'patient_identifier' })
  patientIdentifier: number;

  @Column({ name: 'hospital_identifier' })
  hospitalIdentifier: number;

  @ManyToOne(() => User, (patient) => patient.patientRecords)
  @JoinColumn({
    name: 'patient_identifier',
    referencedColumnName: 'identifier',
  })
  patient: User;

  @ManyToOne(() => Hospital, (hospital) => hospital.patientRecords)
  @JoinColumn({
    name: 'hospital_identifier',
    referencedColumnName: 'identifier',
  })
  hospital: Hospital;
}
