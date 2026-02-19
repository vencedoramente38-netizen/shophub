import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

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
  [key: string]: any;
}

Deno.serve(async (req) => {
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
    const body: WebhookBody = await req.json();

    console.log('=== KIRVANO WEBHOOK RECEIVED ===');
    console.log('Body:', JSON.stringify(body, null, 2));

    // Extract status - try common field names
    const status = body.status || body.payment_status || body.transaction_status || '';
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
    const email = body.email ||
      body.customer_email ||
      body.customer?.email ||
      body.buyer?.email ||
      body.client?.email ||
      null;

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
    const productId = body.product_id || body.offer_id || body.product?.id || '';

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      return new Response(JSON.stringify({ error: 'Internal Server Error: Missing Database Configuration' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Check if user already exists in Supabase Auth
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      console.error('Error listing users:', listError);
      return new Response(JSON.stringify({ error: 'Error checking existing users' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const existingUser = existingUsers?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());

    let userId: string;
    let password: string | null = null;
    let isNewUser = false;

    if (existingUser) {
      // User exists - just update access_until
      userId = existingUser.id;
      console.log(`User already exists with ID: ${userId}, updating access_until`);

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
      console.log(`User created with ID: ${userId}`);

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
    const customerName = body.customer_name || body.customer?.name || body.buyer?.name || 'Cliente';
    const amount = body.amount || body.total_amount || body.price || 0;
    const saleId = body.id || body.transaction_id || body.order_id || `manual-${Date.now()}`;

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
      // Don't fail the whole request if just the notification fails
    } else {
      console.log('Sale event recorded successfully');
    }

    // Send welcome email with credentials (only for new users)
    if (isNewUser && password) {
      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      if (resendApiKey) {
        const resend = new Resend(resendApiKey);

        const loginUrl = 'https://tiktoksync.lovable.app/login';

        try {
          await resend.emails.send({
            from: 'TikTokSync <noreply@tiktoksync.lovable.app>',
            to: [email],
            subject: 'Acesso Liberado - TikTokSync',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h1 style="color: #7c3aed; text-align: center;">🎉 Seu acesso foi liberado!</h1>
                
                <p style="font-size: 16px; color: #555;">
                  Olá! Seu pagamento foi aprovado e seu acesso ao <strong>TikTokSync</strong> (Plano ${plan === 'vitalicio' ? 'Vitalício' : 'Mensal'}) já está disponível.
                </p>
                
                <div style="background: #f9f9f9; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #7c3aed;">
                  <h2 style="color: #333; margin-top: 0; font-size: 18px;">Seus dados de acesso:</h2>
                  <p style="font-size: 16px; margin: 10px 0;">
                    <strong>E-mail:</strong> ${email}
                  </p>
                  <p style="font-size: 16px; margin: 10px 0;">
                    <strong>Senha:</strong> ${password}
                  </p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <p style="font-size: 16px; color: #333; font-weight: bold;">
                    Entre com seu e-mail e esta senha no link abaixo:
                  </p>
                  <a href="${loginUrl}" 
                     style="display: inline-block; background: #7c3aed; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">
                    Acessar TikTokSync
                  </a>
                </div>
                
                <p style="font-size: 14px; color: #888; text-align: center;">
                  Recomendamos que você altere sua senha após o primeiro login nas configurações do perfil.
                </p>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                
                <p style="font-size: 12px; color: #aaa; text-align: center;">
                  © ${new Date().getFullYear()} TikTokSync. Todos os direitos reservados.
                </p>
              </div>
            `,
          });
          console.log('Welcome email sent successfully');
        } catch (emailError) {
          console.error('Error sending email:', emailError);
          // Don't fail the webhook if email fails - user is already created
        }
      } else {
        console.log('RESEND_API_KEY not configured, skipping email');
      }
    } else if (!isNewUser) {
      console.log('Existing user - skipping welcome email, just renewed access');
    }

    console.log('================================');

    return new Response(JSON.stringify({
      ok: true,
      renewed: !isNewUser
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(JSON.stringify({
      ok: false,
      message: 'Erro ao processar webhook'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
