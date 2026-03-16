export class InitTenantData1710600001000 {
    async up(queryRunner) {
        await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS cases (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id VARCHAR(64) NOT NULL,
        client_case_uuid UUID NOT NULL,
        canonical_case_number VARCHAR(64),
        temporary_case_number VARCHAR(64) NOT NULL,
        case_type VARCHAR(16) NOT NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'Intake',
        police_hold BOOLEAN NOT NULL DEFAULT FALSE,
        priority BOOLEAN NOT NULL DEFAULT FALSE,
        demographics JSONB,
        intake_summary JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, client_case_uuid),
        UNIQUE (tenant_id, canonical_case_number),
        UNIQUE (tenant_id, temporary_case_number)
      )
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS offline_sync_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id VARCHAR(64) NOT NULL,
        user_id VARCHAR(128) NOT NULL,
        device_id VARCHAR(128) NOT NULL,
        case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
        sync_state VARCHAR(16) NOT NULL DEFAULT 'LocalOnly',
        last_error_code VARCHAR(64),
        last_error_message TEXT,
        last_synced_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS offline_audit_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id VARCHAR(64) NOT NULL,
        user_id VARCHAR(128) NOT NULL,
        device_id VARCHAR(128) NOT NULL,
        event_type VARCHAR(128) NOT NULL,
        event_payload JSONB NOT NULL,
        event_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS hl7_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id VARCHAR(64) NOT NULL,
        lab_code VARCHAR(64) NOT NULL,
        direction VARCHAR(16) NOT NULL,
        message_type VARCHAR(32) NOT NULL,
        message_control_id VARCHAR(128) NOT NULL,
        payload_hash VARCHAR(128) NOT NULL,
        raw_message TEXT NOT NULL,
        processing_state VARCHAR(16) NOT NULL DEFAULT 'Received',
        processing_error TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, lab_code, message_control_id, payload_hash)
      )
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS lab_orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id VARCHAR(64) NOT NULL,
        case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
        lab_code VARCHAR(64) NOT NULL,
        order_number VARCHAR(128) NOT NULL,
        status VARCHAR(16) NOT NULL DEFAULT 'Created',
        ordered_items JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS lab_results (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id VARCHAR(64) NOT NULL,
        case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
        lab_order_id UUID,
        lab_code VARCHAR(64) NOT NULL,
        analyte_code VARCHAR(64) NOT NULL,
        result_value VARCHAR(255),
        result_unit VARCHAR(64),
        flag VARCHAR(16),
        source_metadata JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    }
    async down(queryRunner) {
        await queryRunner.query('DROP TABLE IF EXISTS lab_results');
        await queryRunner.query('DROP TABLE IF EXISTS lab_orders');
        await queryRunner.query('DROP TABLE IF EXISTS hl7_messages');
        await queryRunner.query('DROP TABLE IF EXISTS offline_audit_events');
        await queryRunner.query('DROP TABLE IF EXISTS offline_sync_sessions');
        await queryRunner.query('DROP TABLE IF EXISTS cases');
    }
}
