import type { MigrationInterface, QueryRunner } from 'typeorm';

export class ReportingWorkflow1710600004000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS case_reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id VARCHAR(64) NOT NULL,
        case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
        version_no INT NOT NULL,
        status VARCHAR(16) NOT NULL DEFAULT 'Generated',
        report_body TEXT,
        signed_by VARCHAR(128),
        signed_at TIMESTAMPTZ,
        exported_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, case_id, version_no)
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS case_reports');
  }
}