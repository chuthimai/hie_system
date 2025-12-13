import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1765098578130 implements MigrationInterface {
    name = 'Migration1765098578130'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`hospitals\` (\`identifier\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, PRIMARY KEY (\`identifier\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`patient-records\` (\`identifier\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`hash\` varchar(255) NOT NULL, \`blockId\` int NULL, \`transactionId\` int NULL, \`created_time\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \`patient_identifier\` bigint UNSIGNED NOT NULL, \`hospital_identifier\` int NOT NULL, PRIMARY KEY (\`identifier\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`users\` (\`identifier\` bigint UNSIGNED NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`telecom\` varchar(255) NULL, \`birth_date\` date NOT NULL, \`gender\` tinyint NOT NULL, \`address\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, PRIMARY KEY (\`identifier\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`permissions\` (\`identifier\` int NOT NULL AUTO_INCREMENT, \`type\` varchar(255) NOT NULL DEFAULT 'READ_PATIENT_RECORD', \`expired_time\` timestamp NOT NULL, \`user_identifier\` bigint UNSIGNED NOT NULL, \`hospital_identifier\` int NOT NULL, PRIMARY KEY (\`identifier\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`patient-records\` DROP COLUMN \`patient_identifier\``);
        await queryRunner.query(`ALTER TABLE \`patient-records\` ADD \`patient_identifier\` bigint UNSIGNED NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`identifier\` \`identifier\` bigint UNSIGNED NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`identifier\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`identifier\` bigint UNSIGNED NOT NULL PRIMARY KEY AUTO_INCREMENT`);
        await queryRunner.query(`ALTER TABLE \`permissions\` DROP COLUMN \`user_identifier\``);
        await queryRunner.query(`ALTER TABLE \`permissions\` ADD \`user_identifier\` bigint UNSIGNED NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`patient-records\` ADD CONSTRAINT \`FK_e13a3ce07b8f87ff4945373000b\` FOREIGN KEY (\`patient_identifier\`) REFERENCES \`users\`(\`identifier\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`patient-records\` ADD CONSTRAINT \`FK_4185010e42a14b56a2f64f72dfd\` FOREIGN KEY (\`hospital_identifier\`) REFERENCES \`hospitals\`(\`identifier\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`patient-records\` DROP FOREIGN KEY \`FK_4185010e42a14b56a2f64f72dfd\``);
        await queryRunner.query(`ALTER TABLE \`patient-records\` DROP FOREIGN KEY \`FK_e13a3ce07b8f87ff4945373000b\``);
        await queryRunner.query(`ALTER TABLE \`permissions\` DROP COLUMN \`user_identifier\``);
        await queryRunner.query(`ALTER TABLE \`permissions\` ADD \`user_identifier\` bigint UNSIGNED NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`identifier\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`identifier\` bigint UNSIGNED NOT NULL AUTO_INCREMENT`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD PRIMARY KEY (\`identifier\`)`);
        await queryRunner.query(`ALTER TABLE \`users\` CHANGE \`identifier\` \`identifier\` bigint UNSIGNED NOT NULL AUTO_INCREMENT`);
        await queryRunner.query(`ALTER TABLE \`patient-records\` DROP COLUMN \`patient_identifier\``);
        await queryRunner.query(`ALTER TABLE \`patient-records\` ADD \`patient_identifier\` bigint UNSIGNED NOT NULL`);
        await queryRunner.query(`DROP TABLE \`permissions\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP TABLE \`patient-records\``);
        await queryRunner.query(`DROP TABLE \`hospitals\``);
    }

}
