import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit, createAuditLog } from '@/ai/security';

/**
 * Mock FHIR Endpoint for Patient interoperability
 * Complies with FHIR R4 standard structure.
 *
 * IMPORTANT: This endpoint enforces strict consent checks.
 */
import { connection } from 'next/server';

export async function GET(req: NextRequest) {
  await connection();
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown_ip';
    const isAllowed = await checkRateLimit(ip, 30, 60000);
    if (!isAllowed) {
      return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
    }

    const searchParams = req.nextUrl.searchParams;
    const patientId = searchParams.get('_id');

    if (patientId) {
      createAuditLog('FHIR_ACCESS_BY_ID', { ip, patientId });
    } else {
      createAuditLog('FHIR_ACCESS_ALL', { ip });
    }

    if (!patientId) {
      return NextResponse.json(
        {
          resourceType: 'OperationOutcome',
          issue: [{ severity: 'error', code: 'required', diagnostics: 'Missing _id parameter' }],
        },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    // 1. Verify Authentication
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        {
          resourceType: 'OperationOutcome',
          issue: [{ severity: 'error', code: 'security', diagnostics: 'Unauthorized' }],
        },
        { status: 401 },
      );
    }

    // 2. Enforce Strict Consent Check (Sovereign Data Policy)
    // We check if the patient has granted 'health_system_integration' consent
    const { data: consentData, error: consentError } = await supabase
      .from('user_consents')
      .select('*')
      .eq('user_id', patientId)
      .eq('consent_type', 'health_system_integration')
      .eq('status', 'granted')
      .single();

    if (consentError || !consentData) {
      return NextResponse.json(
        {
          resourceType: 'OperationOutcome',
          issue: [
            {
              severity: 'error',
              code: 'forbidden',
              diagnostics: 'Patient has not granted consent for health system integration.',
            },
          ],
        },
        { status: 403 },
      );
    }

    // 3. Return Mock FHIR Patient Resource
    return NextResponse.json({
      resourceType: 'Patient',
      id: patientId,
      meta: {
        lastUpdated: new Date().toISOString(),
      },
      text: {
        status: 'generated',
        div: '<div xmlns=\"http://www.w3.org/1999/xhtml\">Patient has consented to integration.</div>',
      },
      active: true,
      identifier: [
        {
          use: 'usual',
          system: 'https://standards.digital.health.nz/ns/nhi-id',
          value: 'ABC1234',
        },
      ],
      // Anonymised for demonstration
      name: [{ use: 'official', family: 'REDACTED', given: ['REDACTED'] }],
      communication: [
        {
          language: {
            coding: [{ system: 'urn:ietf:bcp:47', code: 'mi', display: 'Te Reo Maori' }],
          },
          preferred: true,
        },
      ],
    });
  } catch (error) {
    console.error('FHIR Route Error:', error);
    return NextResponse.json(
      {
        resourceType: 'OperationOutcome',
        issue: [{ severity: 'fatal', code: 'exception', diagnostics: 'Internal server error' }],
      },
      { status: 500 },
    );
  }
}
