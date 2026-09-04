import { app } from './src/server';
import http from 'http';

async function runTests() {
  console.log('🧪 Iniciando testes de verificação da Etapa 2 (Autenticação e Perfis)...');

  // 1. Iniciar servidor de teste em porta livre (ex: 3335)
  const port = 3335;
  const server = http.createServer(app);
  
  await new Promise<void>((resolve) => {
    server.listen(port, () => {
      console.log(`📡 Servidor de teste ouvindo em http://localhost:${port}`);
      resolve();
    });
  });

  const baseUrl = `http://localhost:${port}`;
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    const timestamp = Date.now();
    const testUsername = `user_${timestamp}`;
    let authToken = '';

    // Teste 1: Registro de novo usuário
    console.log('\n--- 1. Teste de Registro ---');
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: testUsername,
        password: 'password123',
        name: 'Aluno Teste',
        bio: 'Estudante de Informática na DIATINF/IFRN',
      }),
    });
    const regData = await regRes.json();
    assert(regRes.status === 201, `Status de registro deve ser 201 (recebido: ${regRes.status})`);
    assert(!!regData.token, 'Token JWT deve ser retornado no registro');
    assert(regData.user.username === testUsername, `Nome de usuário cadastrado correto: ${regData.user.username}`);
    assert(!regData.user.password, 'Hash de senha NUNCA deve ser retornado na resposta');

    // Teste 2: Registro duplicado
    console.log('\n--- 2. Teste de Duplicidade de Usuário ---');
    const dupRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: testUsername,
        password: 'password123',
        name: 'Outro Aluno',
      }),
    });
    assert(dupRes.status === 409, `Registro duplicado deve retornar 409 (recebido: ${dupRes.status})`);

    // Teste 3: Login com senha incorreta
    console.log('\n--- 3. Teste de Senha Incorreta ---');
    const wrongLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: testUsername,
        password: 'wrongpassword',
      }),
    });
    assert(wrongLoginRes.status === 401, `Login inválido deve retornar 401 (recebido: ${wrongLoginRes.status})`);

    // Teste 4: Login correto
    console.log('\n--- 4. Teste de Login com Sucesso ---');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: testUsername,
        password: 'password123',
      }),
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200, `Login deve retornar 200 (recebido: ${loginRes.status})`);
    assert(!!loginData.token, 'Token JWT deve ser retornado no login');
    authToken = loginData.token;

    // Teste 5: Acesso autenticado a /users/me
    console.log('\n--- 5. Teste de Rota Protegida (/users/me) ---');
    const meRes = await fetch(`${baseUrl}/users/me`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const meData = await meRes.json();
    assert(meRes.status === 200, `GET /users/me com token deve retornar 200 (recebido: ${meRes.status})`);
    assert(meData.username === testUsername, `Usuário retornado corresponde: ${meData.username}`);
    assert(meData._count !== undefined, 'Contadores de posts/comments devem ser retornados');

    // Teste 6: Acesso sem token a /users/me
    console.log('\n--- 6. Teste de Bloqueio sem Token ---');
    const noTokenRes = await fetch(`${baseUrl}/users/me`);
    assert(noTokenRes.status === 401, `GET /users/me sem token deve retornar 401 (recebido: ${noTokenRes.status})`);

    // Teste 7: Perfil público acessível SEM autenticação (Regra 5)
    console.log('\n--- 7. Teste de Perfil Público (Regra 5) ---');
    const pubProfileRes = await fetch(`${baseUrl}/users/profile/${testUsername}`);
    const pubProfileData = await pubProfileRes.json();
    assert(pubProfileRes.status === 200, `Perfil público sem token deve retornar 200 (recebido: ${pubProfileRes.status})`);
    assert(pubProfileData.username === testUsername, `Nome de usuário público correto: ${pubProfileData.username}`);
    assert(pubProfileData.bio === 'Estudante de Informática na DIATINF/IFRN', 'Biografia pública retornada corretamente');

    // Teste 8: Perfil inexistente
    console.log('\n--- 8. Teste de Perfil Inexistente ---');
    const notFoundRes = await fetch(`${baseUrl}/users/profile/nao_existe_12345`);
    assert(notFoundRes.status === 404, `Perfil inexistente deve retornar 404 (recebido: ${notFoundRes.status})`);

    console.log(`\n🏁 Resultado: ${passed} passaram, ${failed} falharam.`);
    if (failed > 0) {
      process.exit(1);
    }
  } finally {
    server.close();
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Erro na execução dos testes:', err);
  process.exit(1);
});

