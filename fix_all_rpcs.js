import pg from 'pg';

async function fix() {
  const client = new pg.Client({
    connectionString: 'postgresql://postgres:Directoweb710*@db.cyhauxixcysfvsguqnyx.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  console.log('Connected to PostgreSQL database.');

  // Drop existing functions to avoid parameter / return type mismatch errors
  await client.query(`
    DROP FUNCTION IF EXISTS public.get_meses_disponibles() CASCADE;
    DROP FUNCTION IF EXISTS public.get_semanas_disponibles() CASCADE;
    DROP FUNCTION IF EXISTS public.get_periodos_disponibles() CASCADE;
    DROP FUNCTION IF EXISTS public.get_resumen_mensual_full() CASCADE;
    DROP FUNCTION IF EXISTS public.get_resumen_semanal_full() CASCADE;
    DROP FUNCTION IF EXISTS public.get_resumen_mensual(integer[], integer[]) CASCADE;
    DROP FUNCTION IF EXISTS public.get_resumen_semanal(integer[], integer[]) CASCADE;
    DROP FUNCTION IF EXISTS public.get_resumen_mensual() CASCADE;
    DROP FUNCTION IF EXISTS public.get_resumen_semanal() CASCADE;
  `);
  console.log('✓ Dropped legacy functions.');

  // 1. get_resumen_mensual_full (exact SQL specified by user)
  await client.query(`
    CREATE OR REPLACE FUNCTION public.get_resumen_mensual_full()
    RETURNS TABLE(
      anio            integer,
      mes             integer,
      negocio         text,
      val             text,
      total_ingreso   numeric,
      total_servicios bigint,
      ticket_promedio numeric
    )
    LANGUAGE sql
    STABLE
    SECURITY DEFINER
    SET statement_timeout = '60000'
    AS $$
      SELECT 
        EXTRACT(YEAR FROM "Fecha")::INT AS anio,
        EXTRACT(MONTH FROM "Fecha")::INT AS mes,
        "Negocio"::text, 
        "Val"::text, 
        SUM(ingreso_total) AS total_ingreso, 
        COUNT("idServicio") AS total_servicios,
        ROUND(
          (SUM(ingreso_total)::NUMERIC / NULLIF(COUNT("idServicio"), 0)), 
          2
        ) AS ticket_promedio
      FROM public.tb_servicios_total 
      GROUP BY 1, 2, "Negocio", "Val"
      ORDER BY anio, mes, "Negocio", "Val";
    $$;
  `);
  await client.query(`GRANT EXECUTE ON FUNCTION public.get_resumen_mensual_full() TO anon, authenticated, service_role;`);
  console.log('✓ Created get_resumen_mensual_full()');

  // 2. get_resumen_semanal_full (exact SQL specified by user)
  await client.query(`
    CREATE OR REPLACE FUNCTION public.get_resumen_semanal_full()
    RETURNS TABLE(
      anio            integer,
      semana          integer,
      negocio         text,
      val             text,
      total_ingreso   numeric,
      total_servicios bigint,
      ticket_promedio numeric
    )
    LANGUAGE sql
    STABLE
    SECURITY DEFINER
    SET statement_timeout = '60000'
    AS $$
      SELECT 
        EXTRACT(YEAR FROM "Fecha")::INT AS anio,
        EXTRACT(WEEK FROM "Fecha")::INT AS semana,
        "Negocio"::text, 
        "Val"::text, 
        SUM(ingreso_total) AS total_ingreso, 
        COUNT("idServicio") AS total_servicios,
        ROUND(
          (SUM(ingreso_total)::NUMERIC / NULLIF(COUNT("idServicio"), 0)), 
          2
        ) AS ticket_promedio
      FROM public.tb_servicios_total 
      GROUP BY 1, 2, "Negocio", "Val";
    $$;
  `);
  await client.query(`GRANT EXECUTE ON FUNCTION public.get_resumen_semanal_full() TO anon, authenticated, service_role;`);
  console.log('✓ Created get_resumen_semanal_full()');

  // 3. get_meses_disponibles using SECURITY DEFINER + statement_timeout
  await client.query(`
    CREATE OR REPLACE FUNCTION public.get_meses_disponibles()
    RETURNS TABLE(anio integer, mes integer)
    LANGUAGE sql
    STABLE
    SECURITY DEFINER
    SET statement_timeout = '60000'
    AS $$
      SELECT DISTINCT anio, mes
      FROM public.get_resumen_mensual_full()
      ORDER BY anio DESC, mes DESC;
    $$;
  `);
  await client.query(`GRANT EXECUTE ON FUNCTION public.get_meses_disponibles() TO anon, authenticated, service_role;`);
  console.log('✓ Created get_meses_disponibles()');

  // 4. get_semanas_disponibles using SECURITY DEFINER + statement_timeout
  await client.query(`
    CREATE OR REPLACE FUNCTION public.get_semanas_disponibles()
    RETURNS TABLE(anio integer, semana integer)
    LANGUAGE sql
    STABLE
    SECURITY DEFINER
    SET statement_timeout = '60000'
    AS $$
      SELECT DISTINCT anio, semana
      FROM public.get_resumen_semanal_full()
      ORDER BY anio DESC, semana DESC;
    $$;
  `);
  await client.query(`GRANT EXECUTE ON FUNCTION public.get_semanas_disponibles() TO anon, authenticated, service_role;`);
  console.log('✓ Created get_semanas_disponibles()');

  // 5. Alias for legacy get_periodos_disponibles
  await client.query(`
    CREATE OR REPLACE FUNCTION public.get_periodos_disponibles()
    RETURNS TABLE(anio integer, mes integer)
    LANGUAGE sql
    STABLE
    SECURITY DEFINER
    SET statement_timeout = '60000'
    AS $$
      SELECT DISTINCT anio, mes
      FROM public.get_resumen_mensual_full()
      ORDER BY anio DESC, mes DESC;
    $$;
  `);
  await client.query(`GRANT EXECUTE ON FUNCTION public.get_periodos_disponibles() TO anon, authenticated, service_role;`);
  console.log('✓ Created get_periodos_disponibles()');

  // Verify functions
  const t0 = Date.now();
  const m = await client.query(`SELECT * FROM public.get_meses_disponibles();`);
  console.log(`\nget_meses_disponibles returned ${m.rows.length} rows in ${Date.now() - t0}ms`);

  const t1 = Date.now();
  const s = await client.query(`SELECT * FROM public.get_semanas_disponibles();`);
  console.log(`get_semanas_disponibles returned ${s.rows.length} rows in ${Date.now() - t1}ms`);

  await client.end();
  console.log('\nRPC functions updated successfully!');
}

fix().catch(console.error);
