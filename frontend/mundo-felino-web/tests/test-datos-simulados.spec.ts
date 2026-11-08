// @ts-check
import { test, expect } from '@playwright/test';
import { apiGetClinics, apiSendChat, API, SUPABASE_URL } from '../src/api.test.js';

test.describe('Diagnóstico Mundo Felino - Datos Simulados', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test('✅ Verificar datos simulados de veterinarios en memoria', async () => {
    console.log('\n🔍 TEST 1: Verificando datos simulados de veterinarios...');
    
    // Obtener veterinarios desde mock data
    const veterinarios = await apiGetClinics();
    
    console.log(`   📊 Total veterinarios cargados: ${veterinarios.length}`);
    console.log('   🏥 Lista de veterinarios:');
    
    if (veterinarios.length === 0) {
      throw new Error('❌ No hay veterinarios cargados - ¡ERROR!');
    }

    // Verificar que tenemos los datos esperados
    expect(veterinarios.length).toBeGreaterThan(0);
    
    // Verificar estructura de cada veterinario
    const primerVet = veterinarios[0];
    console.log('   📋 Estructura del primer veterinario:', JSON.stringify(primerVet, null, 2));
    
    expect(primerVet).toHaveProperty('id');
    expect(primerVet).toHaveProperty('name');
    expect(primerVet).toHaveProperty('address');
    expect(primerVet).toHaveProperty('municipality');
    expect(primerVet).toHaveProperty('phone');
    expect(primerVet).toHaveProperty('emergencyAvailable');
    
    console.log(`   ✅ Datos de veterinarios cargados correctamente (${veterinarios.length} clínicas)`);
  });

  test('✅ Verificar datos simulados del chat IA', async () => {
    console.log('\n🔍 TEST 2: Verificando datos simulados del chat IA...');
    
    // Probar con pregunta sobre alimentación
    const respuesta = await apiSendChat("¿Qué alimento es seguro para gatos?");
    
    console.log('   💬 Pregunta:', respuesta.question);
    console.log('   📝 Respuesta (primeras 200 chars):', respuesta.answer.substring(0, 200));
    console.log('   ⚡ Urgencia:', respuesta.urgency || 'normal');
    
    expect(respuesta).toHaveProperty('answer');
    expect(respuesta.answer.length).toBeGreaterThan(50); // Respuesta debería ser considerable
    
    console.log(`   ✅ Datos del chat IA cargados correctamente`);
  });

  test('✅ Verificar veterinarios por municipio', async () => {
    console.log('\n🔍 TEST 3: Buscando veterinarios en Caracas...');
    
    const veterinariosCaracas = await apiGetClinics('caracas');
    
    console.log(`   📊 Veterinarios en Caracas: ${veterinariosCaracas.length}`);
    
    if (veterinariosCaracas.length > 0) {
      veterinariosCaracas.forEach((vet, index) => {
        console.log(`      ${index + 1}. ${vet.name} - ${vet.address}`);
      });
    }
    
    expect(veterinariosCaracas.length).toBeGreaterThan(0);
    console.log(`   ✅ Búsqueda por municipio funcionando`);
  });

  test('✅ Verificar veterinarios de urgencia', async () => {
    console.log('\n🔍 TEST 4: Buscando veterinarios con guardia...');
    
    const veterinariosUrgencia = await apiGetClinics(undefined, true);
    
    console.log(`   📊 Veterinarios con guardia: ${veterinariosUrgencia.length}`);
    
    if (veterinariosUrgencia.length > 0) {
      veterinariosUrgencia.forEach((vet, index) => {
        console.log(`      ${index + 1}. ${vet.name} - 🚨 ${vet.address}`);
      });
    }
    
    expect(veterinariosUrgencia.length).toBeGreaterThan(0);
    console.log(`   ✅ Filtro por urgencia funcionando`);
  });

  test('✅ Verificar variables de entorno', async () => {
    console.log('\n🔍 TEST 5: Verificando configuración...');
    
    const config = {
      API_BASE_URL: API,
      SUPABASE_URL: SUPABASE_URL,
    };
    
    console.log('   VITE_API_BASE_URL:', config.API_BASE_URL);
    console.log('   VITE_SUPABASE_URL:', config.SUPABASE_URL || '(undefined - usando mock)');
    
    // En tests, debería ser undefined para usar mock
    expect(config.API_BASE_URL).toBeUndefined();
    expect(config.SUPABASE_URL).toBeUndefined();
    
    console.log(`   ✅ Configuración de test correcta (usando datos simulados)`);
  });

  test('✅ Listar todos los veterinarios cargados', async () => {
    console.log('\n🔍 TEST 6: Listando todos los veterinarios disponibles...');
    
    const todos = await apiGetClinics();
    
    console.log(`\n   📋 LISTA COMPLETA DE ${todos.length} VETERINARIOS:`);
    console.log('   ' + '='.repeat(80));
    
    todos.forEach((vet, index) => {
      console.log(`\n   ${index + 1}. 🏥 ${vet.name}`);
      console.log(`      📍 ${vet.address}`);
      console.log(`      🏙️  ${vet.municipality}`);
      console.log(`      📞 ${vet.phone || 'No especificado'}`);
      console.log(`      💬 WhatsApp: ${vet.whatsapp || 'No configurado'}`);
      console.log(`      🚨 Urgencias: ${vet.emergencyAvailable ? 'SÍ' : 'NO'}`);
    });
    
    console.log('   ' + '='.repeat(80));
    expect(todos.length).toBeGreaterThan(0);
    console.log(`\n   ✅ Todos los veterinarios cargados correctamente`);
  });

});