export class InitControlPlane1710600000000 {
    async up(queryRunner) {
        await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS tenant_registry (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id VARCHAR(64) NOT NULL UNIQUE,
        subdomain VARCHAR(64) NOT NULL UNIQUE,
        timezone VARCHAR(64) NOT NULL,
        locale VARCHAR(32) NOT NULL,
        status VARCHAR(16) NOT NULL DEFAULT 'active',
        tenant_db_name VARCHAR(128) NOT NULL,
        tenant_db_secret_ref VARCHAR(255),
        okta_issuer VARCHAR(255),
        okta_audience VARCHAR(255),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS tenant_labs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id VARCHAR(64) NOT NULL,
        lab_code VARCHAR(64) NOT NULL,
        display_name VARCHAR(128) NOT NULL,
        mllp_host VARCHAR(255) NOT NULL,
        mllp_port INT NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        config_version VARCHAR(32) NOT NULL DEFAULT '1',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
        await queryRunner.query('CREATE UNIQUE INDEX IF NOT EXISTS ux_tenant_labs_tenant_lab ON tenant_labs (tenant_id, lab_code)');
        await queryRunner.query(`
      INSERT INTO tenant_registry
      (tenant_id, subdomain, timezone, locale, status, tenant_db_name, tenant_db_secret_ref, okta_issuer, okta_audience)
      VALUES
      ('demo', 'demo', 'America/New_York', 'en-US', 'active', 'emedex_demo', NULL, NULL, NULL)
      ON CONFLICT (tenant_id) DO NOTHING
    `);
    }
    async down(queryRunner) {
        await queryRunner.query('DROP TABLE IF EXISTS tenant_labs');
        await queryRunner.query('DROP TABLE IF EXISTS tenant_registry');
    }
}
