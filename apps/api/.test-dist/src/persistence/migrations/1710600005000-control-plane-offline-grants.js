export class ControlPlaneOfflineGrants1710600005000 {
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS offline_device_grants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        grant_id VARCHAR(128) NOT NULL UNIQUE,
        tenant_id VARCHAR(64) NOT NULL,
        user_id VARCHAR(128) NOT NULL,
        device_id VARCHAR(128) NOT NULL,
        scope VARCHAR(64) NOT NULL DEFAULT 'FieldIntake',
        status VARCHAR(16) NOT NULL DEFAULT 'active',
        expires_at TIMESTAMPTZ NOT NULL,
        issued_by VARCHAR(128),
        revoked_by VARCHAR(128),
        revoked_at TIMESTAMPTZ,
        wipe_required BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
        await queryRunner.query('CREATE INDEX IF NOT EXISTS ix_offline_device_grants_tenant_user_device ON offline_device_grants (tenant_id, user_id, device_id)');
    }
    async down(queryRunner) {
        await queryRunner.query('DROP TABLE IF EXISTS offline_device_grants');
    }
}
