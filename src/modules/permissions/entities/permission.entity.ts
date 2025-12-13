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
  })
  expiredTime: Date;

  @Column({ name: 'user_identifier', type: 'bigint', unsigned: true })
  userIdentifier: number;

  @Column({ name: 'hospital_identifier' })
  hospitalIdentifier: number;
}
