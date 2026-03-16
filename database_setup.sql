-- Criação da tabela de usuários
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    plan_type TEXT,
    key_used TEXT,
    activated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criação da tabela de chaves de acesso
CREATE TABLE public.keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL, -- 'monthly' ou 'lifetime'
    used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP WITH TIME ZONE,
    used_by TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Desabilitando RLS para facilitar os testes iniciais (pode ser habilitado depois para mais segurança)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.keys DISABLE ROW LEVEL SECURITY;

-- Inserindo algumas chaves de teste para você usar agora!
INSERT INTO public.keys (key, type, used)
VALUES 
    ('CREATOR-VIP-TESTE', 'lifetime', false),
    ('CREATOR-VIP-OUTRA', 'lifetime', false),
    ('CREATOR-MES-TESTE', 'monthly', false);
