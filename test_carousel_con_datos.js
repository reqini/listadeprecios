/**
 * Script para simular datos y probar el carrusel visualmente
 * Crea productos de ejemplo que cumplen las condiciones del carrusel
 */

const axios = require('axios');

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://backend-catalogosimple.onrender.com';

async function testCarouselWithMockData() {
  console.log('🎠 PRUEBA DEL CARRUSEL CON DATOS SIMULADOS\n');
  console.log('='.repeat(70));
  
  try {
    const response = await axios.get(`${API_BASE_URL}/api/productos`);
    const productos = response.data || [];
    const productosVigentes = productos.filter(p => (p.vigencia || '').toLowerCase() !== 'no');
    
    console.log(`\n📦 Productos vigentes: ${productosVigentes.length}\n`);
    
    // Simular productos para el carrusel agregando campos necesarios
    const productosParaCarrusel = productosVigentes.slice(0, 5).map((p, index) => ({
      ...p,
      lanzamiento: index < 3 ? 'si' : null, // Primeros 3 son lanzamientos
      entrega_inmediata: index >= 3 ? 'si' : null, // Últimos 2 tienen entrega inmediata
      imagen_banner: p.imagen || `https://via.placeholder.com/800x600?text=${encodeURIComponent(p.descripcion || 'Producto')}`,
      vigencia: 'SI',
      prioridad: 5 - index, // Prioridad descendente
    }));
    
    console.log('✅ Productos simulados para el carrusel:\n');
    
    productosParaCarrusel.forEach((p, i) => {
      console.log(`${i + 1}. ${p.descripcion || p.nombre || 'Sin nombre'}`);
      console.log(`   - Código: ${p.codigo}`);
      console.log(`   - Lanzamiento: ${p.lanzamiento || 'no'}`);
      console.log(`   - Entrega Inmediata: ${p.entrega_inmediata || 'no'}`);
      console.log(`   - Imagen Banner: ${p.imagen_banner ? 'Sí' : 'No'}`);
      console.log(`   - Vigencia: ${p.vigencia}`);
      console.log(`   - Prioridad: ${p.prioridad || 'N/A'}`);
      console.log('');
    });
    
    // Verificar condiciones del componente
    console.log('🔍 Verificando condiciones del carrusel:\n');
    
    const productosQueCumplen = productosParaCarrusel.filter((producto) => {
      const vigente = (producto.vigencia || '').toLowerCase() !== 'no';
      if (!vigente) {
        console.log(`   ❌ ${producto.descripcion}: No vigente`);
        return false;
      }

      const esLanzamiento =
        producto.lanzamiento === 'si' ||
        producto.lanzamiento === 'Sí' ||
        producto.lanzamiento === true ||
        producto.lanzamiento === 'SI';
      
      const entregaInmediata =
        producto.entrega_inmediata === 'si' ||
        producto.entrega_inmediata === 'Sí' ||
        producto.entrega_inmediata === true ||
        producto.envio_inmediato === 'si' ||
        producto.envio_inmediato === 'Sí' ||
        producto.entrega_inmediato === 'si';

      if (!esLanzamiento && !entregaInmediata) {
        console.log(`   ❌ ${producto.descripcion}: Sin lanzamiento ni entrega inmediata`);
        return false;
      }

      const imagenBanner = producto.imagen_banner || producto.imagenBanner || producto.banner_imagen;
      if (!imagenBanner || !imagenBanner.trim()) {
        console.log(`   ❌ ${producto.descripcion}: Sin imagen_banner`);
        return false;
      }

      console.log(`   ✅ ${producto.descripcion}: CUMPLE todas las condiciones`);
      return true;
    });
    
    console.log(`\n📊 Total productos que cumplen: ${productosQueCumplen.length} de ${productosParaCarrusel.length}\n`);
    
    if (productosQueCumplen.length > 0) {
      console.log('✅ El carrusel SE MOSTRARÍA con estos productos\n');
      console.log('💡 Para que el carrusel se vea en producción:');
      console.log('   1. En Google Sheets, agregar columna "lanzamiento" o "entrega_inmediata"');
      console.log('   2. Marcar productos con "si" en esas columnas');
      console.log('   3. Agregar columna "imagen_banner" con URL de imagen');
      console.log('   4. Asegurarse que los productos tengan vigencia="SI"\n');
    } else {
      console.log('⚠️  El carrusel NO se mostraría (ningún producto cumple condiciones)\n');
    }
    
    return productosQueCumplen;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    return [];
  }
}

if (require.main === module) {
  testCarouselWithMockData().catch(console.error);
}

module.exports = { testCarouselWithMockData };

