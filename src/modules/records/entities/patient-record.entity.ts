import { Exclude } from 'class-transformer';
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

  @Exclude()
  @Column()
  hash: string;

  @Exclude()
  @Column({ nullable: true })
  blockId: number;

  @Exclude()
  @Column({ nullable: true })
  transactionId: number;

  @Column({
    name: 'created_time',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdTime: string;

  @Exclude()
  @Column({ name: 'patient_identifier', type: 'bigint', unsigned: true })
  patientIdentifier: number;

  @Exclude()
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

  link?: string;
}
