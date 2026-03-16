import type { MigrationInterface, QueryRunner } from 'typeorm';

export class ControlPlaneLabRouting1710600003000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE tenant_labs
      ADD COLUMN IF NOT EXISTS version_no INT NOT NULL DEFAULT 1
    `);

    await queryRunner.query(`
      ALTER TABLE tenant_labs
      ADD COLUMN IF NOT EXISTS routing_rules JSONB NOT NULL DEFAULT '{}'::jsonb
    `);

    await queryRunner.query(`
      ALTER TABLE tenant_labs
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS tenant_lab_routing_audits (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id VARCHAR(64) NOT NULL,
        resolved_lab_code VARCHAR(64) NOT NULL,
        override_applied BOOLEAN NOT NULL DEFAULT FALSE,
        override_reason TEXT,
        requested_by VARCHAR(128),
        request_context JSONB NOT NULL,
        resolved_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS tenant_lab_routing_audits');
    await queryRunner.query('ALTER TABLE tenant_labs DROP COLUMN IF EXISTS updated_at');
    await queryRunner.query('ALTER TABLE tenant_labs DROP COLUMN IF EXISTS routing_rules');
    await queryRunner.query('ALTER TABLE tenant_labs DROP COLUMN IF EXISTS version_no');
  }
}