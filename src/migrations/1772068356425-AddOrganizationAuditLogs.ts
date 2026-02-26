import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrganizationAuditLogs1772068356425 implements MigrationInterface {
    name = 'AddOrganizationAuditLogs1772068356425'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "organization_audit_log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organizationId" uuid NOT NULL, "userId" uuid, "action" character varying NOT NULL, "details" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_58f5da9ded47eefde8617dd301c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "organization_audit_log" ADD CONSTRAINT "FK_cfa64cf6596c2b0e416b50a47f2" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "organization_audit_log" ADD CONSTRAINT "FK_fc0516c160cb38fcc8954417c46" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organization_audit_log" DROP CONSTRAINT "FK_fc0516c160cb38fcc8954417c46"`);
        await queryRunner.query(`ALTER TABLE "organization_audit_log" DROP CONSTRAINT "FK_cfa64cf6596c2b0e416b50a47f2"`);
        await queryRunner.query(`DROP TABLE "organization_audit_log"`);
    }

}
