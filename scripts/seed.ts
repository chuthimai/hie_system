import { EntityTarget, ObjectLiteral } from 'typeorm';

import {
  HospitalData,
  UserData,
} from './initial-data';
import { Hospital } from 'src/modules/hospitals/entities/hospital.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { AppDataSource } from 'data-source';

const entitiesAndData = [
  [Hospital, HospitalData],
  [User, UserData],
];

async function clearAllTablesSafely(dataSource: typeof AppDataSource) {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();

  await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0;');

  try {
    const entities = dataSource.entityMetadatas;
    for (const entity of entities) {
      const repository = queryRunner.manager.getRepository(entity.name);
      await repository.clear();
    }

    // eslint-disable-next-line no-useless-catch
  } catch (err) {
    throw err;
  } finally {
    await queryRunner.release();
  }
}

async function seed() {
  const dataSource = !AppDataSource.isInitialized
    ? await AppDataSource.initialize()
    : AppDataSource;

  await clearAllTablesSafely(dataSource);

  for (const [Entity, data] of entitiesAndData as unknown as [
    EntityTarget<ObjectLiteral>,
    ObjectLiteral[],
  ][]) {
    const repository = dataSource.getRepository(Entity);
    await repository.save(data);
  }

  await dataSource.destroy();
}

if (require.main === module) {
  seed().catch((error) => {
    console.error('Error during seeding:', error);
  });
}
