import { app } from './src/server';
import http from 'http';

async function runPostTests() {
  console.log('🧪 Iniciando testes de verificação da Etapa 3 (Posts, Avaliações e Comentários)...');

  const port = 3336;
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
    // 1. Criar dois usuários para os testes
    const resUserA = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: `user_a_${timestamp}`,
        password: 'password123',
        name: 'Usuário A',
      }),
    });
    const dataA = await resUserA.json();
    const tokenA = dataA.token;

    const resUserB = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: `user_b_${timestamp}`,
        password: 'password123',
        name: 'Usuário B',
      }),
    });
    const dataB = await resUserB.json();
    const tokenB = dataB.token;

    // --- TESTE REGRA 1: Post apenas texto ---
    console.log('\n--- 1. Regra 1: Publicações apenas com texto ---');
    const emptyPostRes = await fetch(`${baseUrl}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({ content: '' }),
    });
    assert(emptyPostRes.status === 400, `Post vazio deve ser rejeitado com 400 (recebido: ${emptyPostRes.status})`);

    const postARes = await fetch(`${baseUrl}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        content: 'Publicação da DIATINF de Redes de Computadores e Servidores.',
      }),
    });
    const postAData = await postARes.json();
    assert(postARes.status === 201, `Post de texto criado com sucesso (status 201)`);
    assert(postAData.content.includes('Redes de Computadores'), 'Conteúdo do post gravado corretamente');
    const postAId = postAData.id;

    // Post do Usuário B
    const postBRes = await fetch(`${baseUrl}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenB}`,
      },
      body: JSON.stringify({
        content: 'Publicação da DIATINF sobre Banco de Dados e Modelagem Relacional.',
      }),
    });
    const postBData = await postBRes.json();
    assert(postBRes.status === 201, `Post do usuário B criado com sucesso`);
    const postBId = postBData.id;

    // --- TESTE REGRA 4: Avaliação de 1 a 3 estrelas ---
    console.log('\n--- 2. Regra 4: Avaliação de posts de 1 a 3 estrelas ---');
    // Tentativa com 0 estrelas (deve falhar)
    const rateZeroRes = await fetch(`${baseUrl}/posts/${postAId}/rate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenB}`,
      },
      body: JSON.stringify({ stars: 0 }),
    });
    assert(rateZeroRes.status === 400, `0 estrelas deve retornar 400 (recebido: ${rateZeroRes.status})`);

    // Tentativa com 4 estrelas (deve falhar)
    const rateFourRes = await fetch(`${baseUrl}/posts/${postAId}/rate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenB}`,
      },
      body: JSON.stringify({ stars: 4 }),
    });
    assert(rateFourRes.status === 400, `4 estrelas deve retornar 400 (recebido: ${rateFourRes.status})`);

    // Usuário B avalia Post A com 2 estrelas
    const rateValidRes = await fetch(`${baseUrl}/posts/${postAId}/rate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenB}`,
      },
      body: JSON.stringify({ stars: 2 }),
    });
    const rateData = await rateValidRes.json();
    assert(rateValidRes.status === 200, `Avaliação com 2 estrelas aceita (200)`);
    assert(rateData.averageRating === 2, `Média inicial deve ser 2 (recebido: ${rateData.averageRating})`);
    assert(rateData.ratingsCount === 1, `Total de avaliações deve ser 1`);

    // Usuário A avalia o próprio Post A com 3 estrelas
    const rateUserARes = await fetch(`${baseUrl}/posts/${postAId}/rate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({ stars: 3 }),
    });
    const rateDataA = await rateUserARes.json();
    assert(rateDataA.averageRating === 2.5, `Média combinada (2+3)/2 deve ser 2.5 (recebido: ${rateDataA.averageRating})`);
    assert(rateDataA.ratingsCount === 2, `Total de avaliações deve ser 2`);

    // Usuário B atualiza nota de 2 para 3 estrelas (upsert)
    const rateUpdateRes = await fetch(`${baseUrl}/posts/${postAId}/rate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenB}`,
      },
      body: JSON.stringify({ stars: 3 }),
    });
    const rateDataUpdate = await rateUpdateRes.json();
    assert(rateDataUpdate.averageRating === 3, `Média recalculada (3+3)/2 deve ser 3.0 (recebido: ${rateDataUpdate.averageRating})`);
    assert(rateDataUpdate.ratingsCount === 2, `Total de avaliações permanece 2 sem duplicidade`);

    // --- TESTE REGRA 3: Comentários encadeados ---
    console.log('\n--- 3. Regra 3: Comentários encadeados ---');
    // Comentário raiz (nível 0)
    const rootCommentRes = await fetch(`${baseUrl}/posts/${postAId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenB}`,
      },
      body: JSON.stringify({
        content: 'Comentário raiz do Usuário B sobre Redes.',
      }),
    });
    const rootCommentData = await rootCommentRes.json();
    assert(rootCommentRes.status === 201, `Comentário raiz criado com status 201`);
    const rootCommentId = rootCommentData.id;

    // Resposta encadeada ao comentário raiz (nível 1)
    const reply1Res = await fetch(`${baseUrl}/posts/${postAId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`,
      },
      body: JSON.stringify({
        content: 'Resposta encadeada do Usuário A ao Usuário B.',
        parentId: rootCommentId,
      }),
    });
    const reply1Data = await reply1Res.json();
    assert(reply1Res.status === 201, `Resposta encadeada criada com status 201`);
    assert(reply1Data.parentId === rootCommentId, `parentId gravado corretamente`);
    const reply1Id = reply1Data.id;

    // Resposta de nível 2 à resposta anterior (encadeamento em múltiplos níveis)
    const reply2Res = await fetch(`${baseUrl}/posts/${postAId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenB}`,
      },
      body: JSON.stringify({
        content: 'Réplica de nível 2 do Usuário B.',
        parentId: reply1Id,
      }),
    });
    assert(reply2Res.status === 201, `Resposta de nível 2 criada com sucesso`);

    // Buscar árvore hierárquica de comentários
    const treeRes = await fetch(`${baseUrl}/posts/${postAId}/comments`);
    const treeData = await treeRes.json();
    assert(treeRes.status === 200, `Busca de árvore de comentários retornou 200`);
    assert(treeData.length === 1, `Apenas 1 comentário raiz na raiz da árvore`);
    assert(treeData[0].replies.length === 1, `Comentário raiz contém 1 resposta filha`);
    assert(treeData[0].replies[0].replies.length === 1, `Resposta de nível 1 contém 1 resposta neta (nível 2)`);

    // --- TESTE REGRA 2: Feed de outros usuários vs Minhas Publicações vs Busca ---
    console.log('\n--- 4. Regra 2: Feed de outros usuários, Minhas publicações e Pesquisa ---');
    // Feed do Usuário A deve conter o Post do Usuário B e NÃO o Post do Usuário A
    const feedARes = await fetch(`${baseUrl}/posts/feed`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const feedAData = await feedARes.json();
    assert(feedARes.status === 200, `Feed do usuário A retornou 200`);
    const hasPostBInFeed = feedAData.some((p: any) => p.id === postBId);
    const hasPostAInFeed = feedAData.some((p: any) => p.id === postAId);
    assert(hasPostBInFeed, `Feed do Usuário A contém o post de outros usuários (Post B)`);
    assert(!hasPostAInFeed, `Feed do Usuário A NÃO contém o próprio post (Post A)`);

    // Minhas publicações do Usuário A deve conter Post A e NÃO Post B
    const myPostsARes = await fetch(`${baseUrl}/posts/my`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    const myPostsAData = await myPostsARes.json();
    assert(myPostsARes.status === 200, `Minhas publicações retornou 200`);
    const hasPostAInMy = myPostsAData.some((p: any) => p.id === postAId);
    const hasPostBInMy = myPostsAData.some((p: any) => p.id === postBId);
    assert(hasPostAInMy, `Minhas publicações contém Post A`);
    assert(!hasPostBInMy, `Minhas publicações NÃO contém Post B`);

    // Pesquisa de publicações
    const searchRes = await fetch(`${baseUrl}/posts/search?q=Redes`);
    const searchData = await searchRes.json();
    assert(searchRes.status === 200, `Busca por "Redes" retornou 200`);
    assert(searchData.some((p: any) => p.id === postAId), `Busca localizou Post A pelo conteúdo`);

    console.log(`\n🏁 Resultado: ${passed} passaram, ${failed} falharam.`);
    if (failed > 0) {
      process.exit(1);
    }
  } finally {
    server.close();
    process.exit(0);
  }
}

runPostTests().catch((err) => {
  console.error('Erro nos testes de posts:', err);
  process.exit(1);
});

