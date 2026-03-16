export class FunctionalCore1710600002000 {
    async up(queryRunner) {
        await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS case_number_sequences (
        tenant_id VARCHAR(64) NOT NULL,
        prefix VARCHAR(16) NOT NULL,
        case_year INT NOT NULL,
        current_value BIGINT NOT NULL DEFAULT 0,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (tenant_id, prefix, case_year)
      )
    `);
        await queryRunner.query(`
      CREATE OR REPLACE FUNCTION assign_canonical_case_number(
        p_tenant_id VARCHAR,
        p_prefix VARCHAR,
        p_case_year INT
      ) RETURNS VARCHAR AS $$
      DECLARE
        next_value BIGINT;
      BEGIN
        INSERT INTO case_number_sequences(tenant_id, prefix, case_year, current_value)
        VALUES (p_tenant_id, UPPER(p_prefix), p_case_year, 0)
        ON CONFLICT (tenant_id, prefix, case_year) DO NOTHING;

        UPDATE case_number_sequences
           SET current_value = current_value + 1,
               updated_at = NOW()
         WHERE tenant_id = p_tenant_id
           AND prefix = UPPER(p_prefix)
           AND case_year = p_case_year
        RETURNING current_value INTO next_value;

        RETURN UPPER(p_prefix) || p_case_year::TEXT || '-' || LPAD(next_value::TEXT, 6, '0');
      END;
      $$ LANGUAGE plpgsql;
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS investigations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id VARCHAR(64) NOT NULL,
        case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
        investigator_user_id VARCHAR(128),
        received_at TIMESTAMPTZ,
        incident_at TIMESTAMPTZ,
        death_at TIMESTAMPTZ,
        death_location JSONB,
        narrative TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, case_id)
      )
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS police_holds (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id VARCHAR(64) NOT NULL,
        case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
        held BOOLEAN NOT NULL DEFAULT TRUE,
        requested_by VARCHAR(128),
        requested_at TIMESTAMPTZ,
        released_by VARCHAR(128),
        released_at TIMESTAMPTZ,
        note TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, case_id)
      )
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS evidence_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id VARCHAR(64) NOT NULL,
        case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
        item_code VARCHAR(64) NOT NULL,
        barcode VARCHAR(128),
        description TEXT,
        storage_location VARCHAR(128),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, case_id, item_code)
      )
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS custody_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id VARCHAR(64) NOT NULL,
        evidence_item_id UUID NOT NULL REFERENCES evidence_items(id) ON DELETE CASCADE,
        event_type VARCHAR(32) NOT NULL,
        actor_user_id VARCHAR(128),
        from_location VARCHAR(128),
        to_location VARCHAR(128),
        reason TEXT,
        event_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
        await queryRunner.query(`
      CREATE OR REPLACE FUNCTION prevent_custody_event_mutation()
      RETURNS trigger AS $$
      BEGIN
        RAISE EXCEPTION 'custody_events is append-only';
      END;
      $$ LANGUAGE plpgsql;
    `);
        await queryRunner.query(`
      DROP TRIGGER IF EXISTS trg_prevent_custody_event_update ON custody_events;
      CREATE TRIGGER trg_prevent_custody_event_update
      BEFORE UPDATE ON custody_events
      FOR EACH ROW EXECUTE FUNCTION prevent_custody_event_mutation();
    `);
        await queryRunner.query(`
      DROP TRIGGER IF EXISTS trg_prevent_custody_event_delete ON custody_events;
      CREATE TRIGGER trg_prevent_custody_event_delete
      BEFORE DELETE ON custody_events
      FOR EACH ROW EXECUTE FUNCTION prevent_custody_event_mutation();
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS media_assets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id VARCHAR(64) NOT NULL,
        case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
        media_type VARCHAR(32) NOT NULL,
        object_key VARCHAR(512) NOT NULL,
        file_name VARCHAR(255),
        content_type VARCHAR(128),
        sha256 VARCHAR(64),
        captured_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS protocol_versions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id VARCHAR(64) NOT NULL,
        case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
        version_no INT NOT NULL,
        status VARCHAR(16) NOT NULL,
        protocol_body TEXT,
        authored_by VARCHAR(128),
        authored_at TIMESTAMPTZ,
        finalized_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, case_id, version_no)
      )
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS cremation_cases (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id VARCHAR(64) NOT NULL,
        case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
        funeral_home_name VARCHAR(255),
        approved_by VARCHAR(128),
        approved_at TIMESTAMPTZ,
        indigent BOOLEAN NOT NULL DEFAULT FALSE,
        fee NUMERIC(10, 2),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, case_id)
      )
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS indigent_cases (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id VARCHAR(64) NOT NULL,
        case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
        referral_notes TEXT,
        disposition_notes TEXT,
        funding JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, case_id)
      )
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS reference_agencies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id VARCHAR(64) NOT NULL,
        agency_name VARCHAR(255) NOT NULL,
        agency_type VARCHAR(64),
        phone VARCHAR(32),
        fax VARCHAR(32),
        address JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, agency_name)
      )
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS reference_case_types (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id VARCHAR(64) NOT NULL,
        case_type_code VARCHAR(16) NOT NULL,
        description VARCHAR(255),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, case_type_code)
      )
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS hl7_unmatched_results (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id VARCHAR(64) NOT NULL,
        lab_code VARCHAR(64) NOT NULL,
        hl7_message_id UUID NOT NULL REFERENCES hl7_messages(id) ON DELETE CASCADE,
        message_control_id VARCHAR(128) NOT NULL,
        payload_hash VARCHAR(64) NOT NULL,
        status VARCHAR(16) NOT NULL DEFAULT 'Open',
        matched_case_id UUID,
        matched_by VARCHAR(128),
        matched_at TIMESTAMPTZ,
        rejected_reason TEXT,
        rejected_by VARCHAR(128),
        rejected_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (tenant_id, lab_code, message_control_id, payload_hash)
      )
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS audit_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id VARCHAR(64) NOT NULL,
        actor_subject VARCHAR(128),
        actor_roles JSONB,
        device_id VARCHAR(128),
        ip_address VARCHAR(64),
        event_type VARCHAR(64) NOT NULL,
        target_type VARCHAR(64) NOT NULL,
        target_id VARCHAR(128) NOT NULL,
        before_state JSONB,
        after_state JSONB,
        event_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    }
    async down(queryRunner) {
        await queryRunner.query('DROP TABLE IF EXISTS audit_events');
        await queryRunner.query('DROP TABLE IF EXISTS hl7_unmatched_results');
        await queryRunner.query('DROP TABLE IF EXISTS reference_case_types');
        await queryRunner.query('DROP TABLE IF EXISTS reference_agencies');
        await queryRunner.query('DROP TABLE IF EXISTS indigent_cases');
        await queryRunner.query('DROP TABLE IF EXISTS cremation_cases');
        await queryRunner.query('DROP TABLE IF EXISTS protocol_versions');
        await queryRunner.query('DROP TABLE IF EXISTS media_assets');
        await queryRunner.query('DROP FUNCTION IF EXISTS prevent_custody_event_mutation()');
        await queryRunner.query('DROP TABLE IF EXISTS custody_events');
        await queryRunner.query('DROP TABLE IF EXISTS evidence_items');
        await queryRunner.query('DROP TABLE IF EXISTS police_holds');
        await queryRunner.query('DROP TABLE IF EXISTS investigations');
        await queryRunner.query('DROP FUNCTION IF EXISTS assign_canonical_case_number(VARCHAR, VARCHAR, INT)');
        await queryRunner.query('DROP TABLE IF EXISTS case_number_sequences');
    }
}
