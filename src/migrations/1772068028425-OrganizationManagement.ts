import { MigrationInterface, QueryRunner } from "typeorm";

export class OrganizationManagement1772068028425 implements MigrationInterface {
    name = 'OrganizationManagement1772068028425'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."organization_member_role_enum" AS ENUM('OWNER', 'ADMIN', 'RECRUITER', 'INTERVIEWER')`);
        await queryRunner.query(`CREATE TABLE "organization_member" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "role" "public"."organization_member_role_enum" NOT NULL DEFAULT 'RECRUITER', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "organizationId" uuid, "userId" uuid, CONSTRAINT "PK_81dbbb093cbe0539c170f3d1484" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "organization" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "slug" character varying NOT NULL, "logoUrl" character varying, "description" text, "website" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_a08804baa7c5d5427067c49a31f" UNIQUE ("slug"), CONSTRAINT "PK_472c1f99a32def1b0abb219cd67" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."organization_invitation_role_enum" AS ENUM('OWNER', 'ADMIN', 'RECRUITER', 'INTERVIEWER')`);
        await queryRunner.query(`CREATE TYPE "public"."organization_invitation_status_enum" AS ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED')`);
        await queryRunner.query(`CREATE TABLE "organization_invitation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "role" "public"."organization_invitation_role_enum" NOT NULL DEFAULT 'RECRUITER', "status" "public"."organization_invitation_status_enum" NOT NULL DEFAULT 'PENDING', "token" character varying NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "organizationId" uuid, CONSTRAINT "PK_cc1ac752952740b92ead1ee9249" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "job" DROP COLUMN "organizationId"`);
        await queryRunner.query(`ALTER TABLE "job" ADD "organizationId" uuid`);
        await queryRunner.query(`ALTER TABLE "saved_job" ADD CONSTRAINT "UQ_e78c19878d2e6143e4c6140c81c" UNIQUE ("userId", "jobId")`);
        await queryRunner.query(`ALTER TABLE "job_deadline_reminder" ADD CONSTRAINT "UQ_cb091a02d3147c6b42abb6a415b" UNIQUE ("userId", "jobId")`);
        await queryRunner.query(`ALTER TABLE "organization_member" ADD CONSTRAINT "FK_1eb787f3c820ab2e58b7204f765" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "organization_member" ADD CONSTRAINT "FK_b286fe4d85c2c978fe66f5d6ff8" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "job" ADD CONSTRAINT "FK_e4d9a1a72f4cfd52e7a07f30e6e" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "organization_invitation" ADD CONSTRAINT "FK_58d9ca5d9f882ad8be530d247f1" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organization_invitation" DROP CONSTRAINT "FK_58d9ca5d9f882ad8be530d247f1"`);
        await queryRunner.query(`ALTER TABLE "job" DROP CONSTRAINT "FK_e4d9a1a72f4cfd52e7a07f30e6e"`);
        await queryRunner.query(`ALTER TABLE "organization_member" DROP CONSTRAINT "FK_b286fe4d85c2c978fe66f5d6ff8"`);
        await queryRunner.query(`ALTER TABLE "organization_member" DROP CONSTRAINT "FK_1eb787f3c820ab2e58b7204f765"`);
        await queryRunner.query(`ALTER TABLE "job_deadline_reminder" DROP CONSTRAINT "UQ_cb091a02d3147c6b42abb6a415b"`);
        await queryRunner.query(`ALTER TABLE "saved_job" DROP CONSTRAINT "UQ_e78c19878d2e6143e4c6140c81c"`);
        await queryRunner.query(`ALTER TABLE "job" DROP COLUMN "organizationId"`);
        await queryRunner.query(`ALTER TABLE "job" ADD "organizationId" character varying`);
        await queryRunner.query(`DROP TABLE "organization_invitation"`);
        await queryRunner.query(`DROP TYPE "public"."organization_invitation_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."organization_invitation_role_enum"`);
        await queryRunner.query(`DROP TABLE "organization"`);
        await queryRunner.query(`DROP TABLE "organization_member"`);
        await queryRunner.query(`DROP TYPE "public"."organization_member_role_enum"`);
    }

}
