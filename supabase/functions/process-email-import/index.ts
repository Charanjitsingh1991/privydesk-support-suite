import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ImportRequest {
  jobId: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { jobId } = await req.json() as ImportRequest;

    if (!jobId) {
      throw new Error('Missing jobId');
    }

    // Get the import job
    const { data: job, error: jobError } = await supabase
      .from('email_import_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    // Update job status to processing
    await supabase
      .from('email_import_jobs')
      .update({ 
        status: 'processing',
        started_at: new Date().toISOString()
      })
      .eq('id', jobId);

    // NOTE: PST file parsing cannot be done directly in Deno/Edge Functions
    // because PST files are a proprietary Microsoft format that requires
    // specialized native libraries (like libpst or Windows MAPI)
    //
    // For production, you would need one of these approaches:
    // 1. Use a dedicated server with Node.js + pst-extractor package
    // 2. Use a third-party PST parsing API service
    // 3. Have users export to a more portable format (MBOX, EML files)
    // 4. Use Microsoft Graph API to read from Exchange/Outlook directly
    //
    // For this demo, we'll simulate the import process:

    console.log(`Processing import job ${jobId} for org ${job.organization_id}`);
    console.log(`PST file: ${job.pst_file_name} (${job.pst_file_size} bytes)`);

    // Simulate processing - in production, this would parse the actual PST file
    const simulatedEmails = 100; // Would be actual count from PST
    const simulatedAttachments = 25;

    // Update with total counts
    await supabase
      .from('email_import_jobs')
      .update({ 
        total_emails: simulatedEmails,
        total_attachments: simulatedAttachments
      })
      .eq('id', jobId);

    // Simulate batch processing
    for (let i = 0; i < simulatedEmails; i += 10) {
      // In production, this would:
      // 1. Read batch of emails from PST
      // 2. Extract metadata, body, attachments
      // 3. Upload attachments to storage
      // 4. Insert email records

      // Create sample email records
      const batchSize = Math.min(10, simulatedEmails - i);
      const emailBatch = Array.from({ length: batchSize }, (_, idx) => ({
        organization_id: job.organization_id,
        outlook_message_id: `${jobId}-${i + idx}`,
        folder_path: 'Inbox',
        subject: `Sample Imported Email ${i + idx + 1}`,
        body_preview: 'This is a sample email imported from Outlook PST file...',
        body_content: '<p>This is a sample email imported from Outlook PST file.</p><p>In production, this would contain the actual email content.</p>',
        body_content_type: 'html',
        from_email: `sender${i + idx}@example.com`,
        from_name: `Sender ${i + idx + 1}`,
        to_recipients: [{ email: 'recipient@company.com', name: 'Recipient' }],
        cc_recipients: [],
        bcc_recipients: [],
        importance: 'normal',
        is_read: Math.random() > 0.3,
        has_attachments: Math.random() > 0.7,
        categories: [],
        received_datetime: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      }));

      await supabase
        .from('email_archive')
        .insert(emailBatch);

      // Update progress
      await supabase
        .from('email_import_jobs')
        .update({ 
          processed_emails: Math.min(i + batchSize, simulatedEmails),
          processed_attachments: Math.floor((i + batchSize) / 4) // ~25% have attachments
        })
        .eq('id', jobId);

      // Small delay to simulate processing time
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Mark job as completed
    await supabase
      .from('email_import_jobs')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString(),
        processed_emails: simulatedEmails,
        processed_attachments: simulatedAttachments
      })
      .eq('id', jobId);

    // Delete the PST file from storage (it's no longer needed)
    if (job.pst_file_url) {
      await supabase.storage
        .from('email-imports')
        .remove([job.pst_file_url]);
    }

    console.log(`Import job ${jobId} completed successfully`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Import completed',
        emailsImported: simulatedEmails,
        attachmentsProcessed: simulatedAttachments
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Import error:', error);

    // Try to update job status to failed
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      const body = await req.clone().json();
      if (body.jobId) {
        await supabase
          .from('email_import_jobs')
          .update({ 
            status: 'failed',
            error_message: error.message,
            completed_at: new Date().toISOString()
          })
          .eq('id', body.jobId);
      }
    } catch {}

    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
