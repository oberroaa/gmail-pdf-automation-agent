import fetch from 'node-fetch';

async function testVercelEndpoint() {
    const url = 'https://gmail-pdf-automation-agent.vercel.app/api/rules';
    console.log(`🔍 Probando conexión a: ${url}`);
    
    try {
        const response = await fetch(url);
        const text = await response.text();
        
        console.log(`\nEstado HTTP: ${response.status} ${response.statusText}`);
        
        try {
            // Intentar parsear como JSON para ver si es una respuesta válida
            const data = JSON.parse(text);
            console.log('\n✅ Respuesta JSON recibida:');
            console.log(JSON.stringify(data, null, 2));
        } catch (e) {
            // Si no es JSON (ej. una página de error de Vercel)
            console.log('\n❌ La respuesta no es JSON válido o es un error del servidor:');
            console.log(text.substring(0, 500) + (text.length > 500 ? '...' : ''));
        }
        
    } catch (error) {
        console.error(`\n❌ Error intentando conectar: ${error.message}`);
    }
}

testVercelEndpoint();
