// @ts-nocheck
/* eslint-disable */
declare const Deno: any;
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate a secure random password
function generatePassword(length = 12): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => chars[byte % chars.length]).join('');
}

interface WebhookBody {
  status?: string;
  payment_status?: string;
  transaction_status?: string;
  email?: string;
  customer_email?: string;
  customer?: { email?: string; name?: string };
  buyer?: { email?: string; name?: string };
  client?: { email?: string };
  product_id?: string;
  offer_id?: string;
  product?: { id?: string };
  customer_name?: string;
  amount?: number | string;
  total_amount?: number | string;
  price?: number | string;
  id?: string | number;
  transaction_id?: string | number;
  order_id?: string | number;
  [key: string]: unknown;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json() as WebhookBody;

    console.log('=== KIRVANO WEBHOOK RECEIVED ===');
    console.log('Body:', JSON.stringify(body, null, 2));

    // Extract status - try common field names
    const status = (body.status || body.payment_status || body.transaction_status || '') as string;
    const statusLower = status.toLowerCase();

    // Check if payment is approved
    if (statusLower !== 'paid' && statusLower !== 'approved') {
      console.log(`Payment status not approved: ${status}`);
      return new Response(JSON.stringify({
        ok: false,
        message: `Status não aprovado: ${status}`
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract email - try common field names
    const email = (body.email ||
      body.customer_email ||
      body.customer?.email ||
      body.buyer?.email ||
      body.client?.email ||
      null) as string | null;

    if (!email) {
      console.log('Email not found in payload');
      return new Response(JSON.stringify({
        ok: false,
        message: 'Email não encontrado no payload'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract product_id
    const productId = (body.product_id || body.offer_id || body.product?.id || '') as string;

    // Determine plan type based on product_id
    let plan: 'mensal' | 'vitalicio' | null = null;

    if (productId === 'be413212-1728-4b4a-bd04-45d02f62125f') {
      plan = 'mensal';
    } else if (productId === '59a5b1d0-fc5a-4ae2-b77b-95fa30b0657c') {
      plan = 'vitalicio';
    }

    if (!plan) {
      console.log(`Unknown product_id: ${productId}`);
      return new Response(JSON.stringify({
        ok: false,
        message: `product_id desconhecido: ${productId}`
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Payment approved - Email: ${email}, Plan: ${plan}`);

    // Initialize Supabase Admin client
    console.log('Fetching Supabase env vars...');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      return new Response(JSON.stringify({ error: 'Internal Server Error: Missing Database Configuration' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Creating Supabase Admin client...');
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Check if user already exists in Supabase Auth
    console.log(`Checking if user exists: ${email}`);
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      console.error('Error listing users:', listError);
      return new Response(JSON.stringify({ error: 'Error checking existing users' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const existingUser = existingUsers?.users?.find((u: { email?: string }) => u.email?.toLowerCase() === email.toLowerCase());

    let userId: string;
    let password: string | null = null;
    let isNewUser = false;

    if (existingUser) {
      // User exists - just update access_until
      userId = existingUser.id;
      console.log(`User already exists with ID: ${userId}, updating profile...`);

      // Calculate new access_until (30 days from now for mensal)
      let accessUntil: string | null = null;
      if (plan === 'mensal') {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        accessUntil = date.toISOString();
      }

      // Update profile with new access_until and plan
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          plan: plan,
          access_until: accessUntil,
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        return new Response(JSON.stringify({
          ok: false,
          message: `Erro ao atualizar perfil: ${updateError.message}`
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('Profile updated successfully');
    } else {
      // New user - create account
      console.log(`Creating new user account for: ${email}`);
      isNewUser = true;
      password = generatePassword(12);

      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
      });

      if (authError) {
        console.error('Error creating user:', authError);
        return new Response(JSON.stringify({
          ok: false,
          message: `Erro ao criar usuário: ${authError.message}`
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (!authData.user) {
        console.error('User created but no user data returned');
        return new Response(JSON.stringify({
          ok: false,
          message: 'Erro ao criar usuário: dados não retornados'
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      userId = authData.user.id;
      console.log(`User created with ID: ${userId}, inserting profile...`);

      // Calculate access_until (30 days from now for mensal, null for vitalicio)
      let accessUntil: string | null = null;
      if (plan === 'mensal') {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        accessUntil = date.toISOString();
      }

      // Insert into profiles table
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: userId,
          email: email,
          plan: plan,
          access_until: accessUntil,
          created_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error('Error inserting profile:', profileError);
        return new Response(JSON.stringify({
          ok: false,
          message: `Erro ao criar perfil: ${profileError.message}`
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('Profile created successfully');
    }

    // Insert into sales_events for real-time notifications
    console.log('Inserting sales event...');
    const customerName = (body.customer_name || body.customer?.name || body.buyer?.name || 'Cliente') as string;
    const amount = (Number(body.amount) || Number(body.total_amount) || Number(body.price) || 0);
    const saleId = (body.id || body.transaction_id || body.order_id || `manual-${Date.now()}`) as string | number;

    const { error: saleError } = await supabaseAdmin
      .from('sales_events')
      .insert({
        sale_id: String(saleId),
        customer_name: customerName,
        customer_email: email,
        amount: Number(amount),
        status: status,
        event_type: 'purchase_approved',
        payload: body
      });

    if (saleError) {
      console.error('Error inserting sale event:', saleError);
    } else {
      console.log('Sale event recorded successfully');
    }

    // Send welcome/renewal email
    console.log('Checking Resend configuration...');
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (resendApiKey) {
      console.log('Initializing Resend...');
      const resend = new Resend(resendApiKey);
      const loginUrl = 'https://tiktoksync.vercel.app/login';

      const subject = isNewUser ? 'Acesso Liberado - TikTokSync' : 'Acesso Renovado - TikTokSync';
      const greeting = isNewUser ? '🎉 Seu acesso foi liberado!' : '✅ Seu acesso foi renovado!';

      try {
        const fromEmail = Deno.env.get('FROM_EMAIL') || 'TikTokSync <contato@tiktoksync.com.br>';
        console.log(`Attempting to send email via Resend to ${email} from ${fromEmail}...`);

        // Wrap Resend call in a timeout race to prevent hanging
        const emailPromise = resend.emails.send({
          from: fromEmail,
          to: [email],
          subject: subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h1 style="color: #7c3aed; text-align: center;">${greeting}</h1>
              <p style="font-size: 16px; color: #555;">Olá! Seu pagamento foi aprovado.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${loginUrl}" style="display: inline-block; background: #7c3aed; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">
                  Acessar TikTokSync
                </a>
              </div>
            </div>
          `,
        });

        // Add a 10s timeout to the Resend call
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Resend timeout')), 10000)
        );

        const { data: emailData, error: emailError } = await Promise.race([emailPromise, timeoutPromise]) as any;

        if (emailError) {
          console.error('Resend Error:', JSON.stringify(emailError));
        } else {
          console.log('Email sent successfully:', JSON.stringify(emailData));
        }
      } catch (err) {
        console.error('Email sending failed or timed out:', err);
      }
    } else {
      console.log('RESEND_API_KEY not found in environment');
    }

    console.log('=== WEBHOOK PROCESSING COMPLETE ===');

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Global capture error:', error);
    return new Response(JSON.stringify({ ok: false, error: 'Internal Server Error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
