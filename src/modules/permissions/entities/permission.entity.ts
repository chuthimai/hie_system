import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn()
  identifier: number;

  @Column({ default: 'READ_PATIENT_RECORD' })
  type: string;

  @Column({
    name: 'expired_time',
    type: 'timestamp',
    default: () => "CURRENT_TIMESTAMP + INTERVAL '30 minutes'",
  })
  expiredTime: Date;

  @Column({ name: 'user_identifier' })
  userIdentifier: number;

  @Column({ name: 'hospital_identifier' })
  hospitalIdentifier: number;
}
