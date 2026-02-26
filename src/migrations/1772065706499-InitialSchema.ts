import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1772065706499 implements MigrationInterface {
    name = 'InitialSchema1772065706499'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."interview_stage_enum" AS ENUM('PHONE_SCREEN', 'TECHNICAL', 'CULTURAL', 'MANAGEMENT', 'FINAL_ROUND', 'OTHER')`);
        await queryRunner.query(`CREATE TYPE "public"."interview_status_enum" AS ENUM('PENDING', 'COMPLETED', 'CANCELLED', 'RESCHEDULED')`);
        await queryRunner.query(`CREATE TABLE "interview" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "stage" "public"."interview_stage_enum" NOT NULL, "scheduledAt" TIMESTAMP NOT NULL, "location" character varying, "status" "public"."interview_status_enum" NOT NULL DEFAULT 'PENDING', "interviewerNotes" text, "candidateFeedback" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "applicationId" uuid, "interviewerId" uuid, CONSTRAINT "PK_44c49a4feadefa5c6fa78bfb7d1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "saved_job" ADD CONSTRAINT "UQ_e78c19878d2e6143e4c6140c81c" UNIQUE ("userId", "jobId")`);
        await queryRunner.query(`ALTER TABLE "job_deadline_reminder" ADD CONSTRAINT "UQ_cb091a02d3147c6b42abb6a415b" UNIQUE ("userId", "jobId")`);
        await queryRunner.query(`ALTER TABLE "interview" ADD CONSTRAINT "FK_35c375805d4e8809adf67f635bb" FOREIGN KEY ("applicationId") REFERENCES "application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "interview" ADD CONSTRAINT "FK_540ce8c6be84d9286b5cd0de493" FOREIGN KEY ("interviewerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "interview" DROP CONSTRAINT "FK_540ce8c6be84d9286b5cd0de493"`);
        await queryRunner.query(`ALTER TABLE "interview" DROP CONSTRAINT "FK_35c375805d4e8809adf67f635bb"`);
        await queryRunner.query(`ALTER TABLE "job_deadline_reminder" DROP CONSTRAINT "UQ_cb091a02d3147c6b42abb6a415b"`);
        await queryRunner.query(`ALTER TABLE "saved_job" DROP CONSTRAINT "UQ_e78c19878d2e6143e4c6140c81c"`);
        await queryRunner.query(`DROP TABLE "interview"`);
        await queryRunner.query(`DROP TYPE "public"."interview_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."interview_stage_enum"`);
    }

}
