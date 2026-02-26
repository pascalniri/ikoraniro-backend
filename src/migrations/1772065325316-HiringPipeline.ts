import { MigrationInterface, QueryRunner } from "typeorm";

export class HiringPipeline1772065325316 implements MigrationInterface {
    name = 'HiringPipeline1772065325316'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "refresh_token" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tokenHash" character varying NOT NULL, "device" character varying, "ipAddress" character varying, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "revoked" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_b575dd3c21fb0831013c909e7fe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_status_enum" AS ENUM('PENDING', 'ACTIVE', 'SUSPENDED', 'LOCKED', 'DELETED')`);
        await queryRunner.query(`CREATE TYPE "public"."user_type_enum" AS ENUM('INDIVIDUAL', 'ORG_USER', 'SOLO_EMPLOYER')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "passwordHash" character varying NOT NULL, "status" "public"."user_status_enum" NOT NULL DEFAULT 'PENDING', "type" "public"."user_type_enum" NOT NULL DEFAULT 'INDIVIDUAL', "firstName" character varying, "lastName" character varying, "isTwoFactorEnabled" boolean NOT NULL DEFAULT false, "twoFactorSecret" character varying, "googleId" character varying, "githubId" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "UQ_470355432cc67b2c470c30bef7c" UNIQUE ("googleId"), CONSTRAINT "UQ_0d84cc6a830f0e4ebbfcd6381dd" UNIQUE ("githubId"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "saved_search" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "criteria" jsonb NOT NULL, "emailAlert" boolean NOT NULL DEFAULT false, "lastAlertedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_563b338d8b4878fa46697c8f3f2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."application_status_enum" AS ENUM('SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEWING', 'OFFER_EXTENDED', 'OFFER_ACCEPTED', 'OFFER_REJECTED', 'REJECTED', 'WITHDRAWN')`);
        await queryRunner.query(`CREATE TABLE "application" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."application_status_enum" NOT NULL DEFAULT 'SUBMITTED', "answers" jsonb, "resumeUrl" character varying, "coverLetterUrl" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "jobId" uuid, "userId" uuid, CONSTRAINT "PK_569e0c3e863ebdf5f2408ee1670" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."job_status_enum" AS ENUM('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'CLOSED', 'EXPIRED', 'ARCHIVED')`);
        await queryRunner.query(`CREATE TYPE "public"."job_jobtype_enum" AS ENUM('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'TEMPORARY', 'REMOTE', 'HYBRID', 'ON_SITE')`);
        await queryRunner.query(`CREATE TABLE "job" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "status" "public"."job_status_enum" NOT NULL DEFAULT 'DRAFT', "jobType" "public"."job_jobtype_enum" NOT NULL, "location" character varying, "remoteOk" boolean NOT NULL DEFAULT true, "description" text, "requirements" text, "salaryMin" integer, "salaryMax" integer, "currency" character varying, "salaryVisible" boolean NOT NULL DEFAULT true, "applicationDeadline" TIMESTAMP, "companyName" character varying, "organizationId" character varying, "customQuestions" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_98ab1c14ff8d1cf80d18703b92f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "saved_job" ("userId" uuid NOT NULL, "jobId" uuid NOT NULL, "savedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e78c19878d2e6143e4c6140c81c" UNIQUE ("userId", "jobId"), CONSTRAINT "PK_e78c19878d2e6143e4c6140c81c" PRIMARY KEY ("userId", "jobId"))`);
        await queryRunner.query(`CREATE TABLE "profile" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "headline" character varying, "bio" text, "phone" character varying, "city" character varying, "country" character varying, "timezone" character varying, "profilePictureUrl" character varying, "openToWork" character varying, "profileVisibility" character varying NOT NULL DEFAULT 'PUBLIC', "openToWorkVisible" boolean NOT NULL DEFAULT true, "workExperience" jsonb, "education" jsonb, "skills" jsonb, "languages" jsonb, "resumeUrl" character varying, "portfolioLinks" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "REL_a24972ebd73b106250713dcddd" UNIQUE ("userId"), CONSTRAINT "PK_3dd8bfc97e4a77c70971591bdcb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "job_deadline_reminder" ("userId" uuid NOT NULL, "jobId" uuid NOT NULL, "daysBefore" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_cb091a02d3147c6b42abb6a415b" UNIQUE ("userId", "jobId"), CONSTRAINT "PK_cb091a02d3147c6b42abb6a415b" PRIMARY KEY ("userId", "jobId"))`);
        await queryRunner.query(`CREATE TYPE "public"."interview_stage_enum" AS ENUM('PHONE_SCREEN', 'TECHNICAL', 'CULTURAL', 'MANAGEMENT', 'FINAL_ROUND', 'OTHER')`);
        await queryRunner.query(`CREATE TYPE "public"."interview_status_enum" AS ENUM('PENDING', 'COMPLETED', 'CANCELLED', 'RESCHEDULED')`);
        await queryRunner.query(`CREATE TABLE "interview" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "stage" "public"."interview_stage_enum" NOT NULL, "scheduledAt" TIMESTAMP NOT NULL, "location" character varying, "status" "public"."interview_status_enum" NOT NULL DEFAULT 'PENDING', "interviewerNotes" text, "candidateFeedback" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "applicationId" uuid, "interviewerId" uuid, CONSTRAINT "PK_44c49a4feadefa5c6fa78bfb7d1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."application_status_history_fromstatus_enum" AS ENUM('SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEWING', 'OFFER_EXTENDED', 'OFFER_ACCEPTED', 'OFFER_REJECTED', 'REJECTED', 'WITHDRAWN')`);
        await queryRunner.query(`CREATE TYPE "public"."application_status_history_tostatus_enum" AS ENUM('SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEWING', 'OFFER_EXTENDED', 'OFFER_ACCEPTED', 'OFFER_REJECTED', 'REJECTED', 'WITHDRAWN')`);
        await queryRunner.query(`CREATE TABLE "application_status_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fromStatus" "public"."application_status_history_fromstatus_enum", "toStatus" "public"."application_status_history_tostatus_enum" NOT NULL, "reason" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "applicationId" uuid, "changedById" uuid, CONSTRAINT "PK_62f7e8a5533a7db21218f2e2434" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "refresh_token" ADD CONSTRAINT "FK_8e913e288156c133999341156ad" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "saved_search" ADD CONSTRAINT "FK_397e5fcfff614ace7edf6831d5b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "application" ADD CONSTRAINT "FK_dbc0341504212f830211b69ba0c" FOREIGN KEY ("jobId") REFERENCES "job"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "application" ADD CONSTRAINT "FK_b4ae3fea4a24b4be1a86dacf8a2" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "saved_job" ADD CONSTRAINT "FK_65314280f947dd20a26faf013d2" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "saved_job" ADD CONSTRAINT "FK_ceb2154a962ca924a284f15c2e7" FOREIGN KEY ("jobId") REFERENCES "job"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "profile" ADD CONSTRAINT "FK_a24972ebd73b106250713dcddd9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "job_deadline_reminder" ADD CONSTRAINT "FK_084728e76b4722ee03cddef1ac0" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "job_deadline_reminder" ADD CONSTRAINT "FK_5158e13739496277848ba6ad018" FOREIGN KEY ("jobId") REFERENCES "job"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "interview" ADD CONSTRAINT "FK_35c375805d4e8809adf67f635bb" FOREIGN KEY ("applicationId") REFERENCES "application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "interview" ADD CONSTRAINT "FK_540ce8c6be84d9286b5cd0de493" FOREIGN KEY ("interviewerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "application_status_history" ADD CONSTRAINT "FK_e30a860ef20ee4bb746cd58632d" FOREIGN KEY ("applicationId") REFERENCES "application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "application_status_history" ADD CONSTRAINT "FK_bf3fc445e47f949e2cf9ac4ca7f" FOREIGN KEY ("changedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "application_status_history" DROP CONSTRAINT "FK_bf3fc445e47f949e2cf9ac4ca7f"`);
        await queryRunner.query(`ALTER TABLE "application_status_history" DROP CONSTRAINT "FK_e30a860ef20ee4bb746cd58632d"`);
        await queryRunner.query(`ALTER TABLE "interview" DROP CONSTRAINT "FK_540ce8c6be84d9286b5cd0de493"`);
        await queryRunner.query(`ALTER TABLE "interview" DROP CONSTRAINT "FK_35c375805d4e8809adf67f635bb"`);
        await queryRunner.query(`ALTER TABLE "job_deadline_reminder" DROP CONSTRAINT "FK_5158e13739496277848ba6ad018"`);
        await queryRunner.query(`ALTER TABLE "job_deadline_reminder" DROP CONSTRAINT "FK_084728e76b4722ee03cddef1ac0"`);
        await queryRunner.query(`ALTER TABLE "profile" DROP CONSTRAINT "FK_a24972ebd73b106250713dcddd9"`);
        await queryRunner.query(`ALTER TABLE "saved_job" DROP CONSTRAINT "FK_ceb2154a962ca924a284f15c2e7"`);
        await queryRunner.query(`ALTER TABLE "saved_job" DROP CONSTRAINT "FK_65314280f947dd20a26faf013d2"`);
        await queryRunner.query(`ALTER TABLE "application" DROP CONSTRAINT "FK_b4ae3fea4a24b4be1a86dacf8a2"`);
        await queryRunner.query(`ALTER TABLE "application" DROP CONSTRAINT "FK_dbc0341504212f830211b69ba0c"`);
        await queryRunner.query(`ALTER TABLE "saved_search" DROP CONSTRAINT "FK_397e5fcfff614ace7edf6831d5b"`);
        await queryRunner.query(`ALTER TABLE "refresh_token" DROP CONSTRAINT "FK_8e913e288156c133999341156ad"`);
        await queryRunner.query(`DROP TABLE "application_status_history"`);
        await queryRunner.query(`DROP TYPE "public"."application_status_history_tostatus_enum"`);
        await queryRunner.query(`DROP TYPE "public"."application_status_history_fromstatus_enum"`);
        await queryRunner.query(`DROP TABLE "interview"`);
        await queryRunner.query(`DROP TYPE "public"."interview_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."interview_stage_enum"`);
        await queryRunner.query(`DROP TABLE "job_deadline_reminder"`);
        await queryRunner.query(`DROP TABLE "profile"`);
        await queryRunner.query(`DROP TABLE "saved_job"`);
        await queryRunner.query(`DROP TABLE "job"`);
        await queryRunner.query(`DROP TYPE "public"."job_jobtype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."job_status_enum"`);
        await queryRunner.query(`DROP TABLE "application"`);
        await queryRunner.query(`DROP TYPE "public"."application_status_enum"`);
        await queryRunner.query(`DROP TABLE "saved_search"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."user_status_enum"`);
        await queryRunner.query(`DROP TABLE "refresh_token"`);
    }

}
