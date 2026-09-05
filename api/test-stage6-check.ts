import { app } from './src/server';
import http from 'http';

async function verifyStage6() {
  console.log('🔍 Executando verificação aprofundada da Etapa 6...');

  const port = 3337;
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(port, () => {
      console.log(`📡 Servidor de teste em http://localhost:${port}`);
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
    // 1. Criar Usuário A e Usuário B
    const userARes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: `analista_${timestamp}`,
        password: 'password123',
        name: 'Analista DIATINF',
        bio: 'Especialista em Redes e Sistemas Distribuídos no IFRN',
      }),
    });
    const userA = await userARes.json();

    const userBRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: `dev_${timestamp}`,
        password: 'password123',
        name: 'Desenvolvedora Web',
        bio: 'Aluna de Infoweb e entusiasta de React e Node',
      }),
    });
    const userB = await userBRes.json();

    // 2. Criar publicações
    // Post 1 do Usuário A
    const post1Res = await fetch(`${baseUrl}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userA.token}`,
      },
      body: JSON.stringify({
        content: 'Configuração de roteadores e switches no laboratório 4 da DIATINF.',
      }),
    });
    const post1 = await post1Res.json();

    // Post 2 do Usuário B
    const post2Res = await fetch(`${baseUrl}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userB.token}`,
      },
      body: JSON.stringify({
        content: 'Desenvolvimento do DIATINF X com Vite, React e Tailwind CSS!',
      }),
    });
    const post2 = await post2Res.json();

    // ==========================================
    // ITEM 1: PERFIL PÚBLICO (REGRA 5)
    // ==========================================
    console.log('\n--- 1. Verificação: Perfil Público (Regra 5) ---');
    // Consulta sem nenhum token (anônimo)
    const profileRes = await fetch(`${baseUrl}/users/profile/${userA.user.username}`);
    assert(profileRes.status === 200, `GET /users/profile/:username anônimo retorna 200 (recebido: ${profileRes.status})`);
    const profileData = await profileRes.json();
    assert(profileData.username === userA.user.username, 'Nome de usuário corresponde');
    assert(profileData.name === 'Analista DIATINF', 'Nome completo corresponde');
    assert(profileData.bio.includes('Sistemas Distribuídos'), 'Biografia pública acessível sem autenticação');
    assert(!profileData.password, 'Senha não exposta');
    assert(profileData._count.posts >= 1, `Contador de posts do perfil correto: ${profileData._count.posts}`);

    // Posts do usuário específico
    const userPostsRes = await fetch(`${baseUrl}/posts/user/${userA.user.username}`);
    assert(userPostsRes.status === 200, `GET /posts/user/:username anônimo retorna 200`);
    const userPosts = await userPostsRes.json();
    assert(userPosts.some((p: any) => p.id === post1.id), 'Lista de publicações do perfil contém o Post 1');
    assert(!userPosts.some((p: any) => p.id === post2.id), 'Lista do perfil NÃO contém posts de outros usuários');

    // ==========================================
    // ITEM 2: PESQUISAR PUBLICAÇÕES (REGRA 2)
    // ==========================================
    console.log('\n--- 2. Verificação: Pesquisar Publicações (Regra 2) ---');
    // Busca por termo presente no Post 1
    const search1Res = await fetch(`${baseUrl}/posts/search?q=roteadores`);
    assert(search1Res.status === 200, `GET /posts/search?q=roteadores retorna 200`);
    const search1Data = await search1Res.json();
    assert(search1Data.some((p: any) => p.id === post1.id), 'Busca localizou Post 1 pela palavra "roteadores"');
    assert(!search1Data.some((p: any) => p.id === post2.id), 'Busca NÃO trouxe Post 2 não relacionado');

    // Busca por termo presente no Post 2
    const search2Res = await fetch(`${baseUrl}/posts/search?q=Tailwind`);
    const search2Data = await search2Res.json();
    assert(search2Data.some((p: any) => p.id === post2.id), 'Busca localizou Post 2 pela palavra "Tailwind"');

    // Busca por termo inexistente
    const searchEmptyRes = await fetch(`${baseUrl}/posts/search?q=palavrainexistente999`);
    const searchEmptyData = await searchEmptyRes.json();
    assert(Array.isArray(searchEmptyData) && searchEmptyData.length === 0, 'Busca por termo inexistente retorna array vazio');

    // ==========================================
    // ITEM 3: VER PUBLICAÇÕES QUANDO LOGADO (REGRA 2)
    // ==========================================
    console.log('\n--- 3. Verificação: Publicações Quando Logado (Regra 2) ---');
    // Usuário A acessa o Feed da tela inicial (deve ver posts de outros, e NÃO o seu próprio)
    const feedLoggedRes = await fetch(`${baseUrl}/posts/feed`, {
      headers: { Authorization: `Bearer ${userA.token}` },
    });
    assert(feedLoggedRes.status === 200, `GET /posts/feed autenticado retorna 200`);
    const feedLoggedData = await feedLoggedRes.json();
    assert(feedLoggedData.some((p: any) => p.id === post2.id), 'Feed autenticado contém publicação de OUTRO usuário (Post 2)');
    assert(!feedLoggedData.some((p: any) => p.id === post1.id), 'Feed autenticado NÃO contém o próprio post do Usuário A (Post 1)');

    // Usuário A acessa "Minhas Publicações" (deve ver o seu próprio, e NÃO o de outros)
    const myPostsRes = await fetch(`${baseUrl}/posts/my`, {
      headers: { Authorization: `Bearer ${userA.token}` },
    });
    assert(myPostsRes.status === 200, `GET /posts/my retorna 200`);
    const myPostsData = await myPostsRes.json();
    assert(myPostsData.some((p: any) => p.id === post1.id), 'Minhas Publicações contém Post 1 do autor');
    assert(!myPostsData.some((p: any) => p.id === post2.id), 'Minhas Publicações NÃO contém Post 2 de outro autor');

    // ==========================================
    // ITEM 4: DETALHES DE PUBLICAÇÃO E COMENTÁRIOS ENCADEADOS (REGRA 3)
    // ==========================================
    console.log('\n--- 4. Verificação: Detalhes de Publicação e Comentários Encadeados (Regra 3) ---');
    // Obter detalhes do Post 1
    const postDetailRes = await fetch(`${baseUrl}/posts/${post1.id}`);
    assert(postDetailRes.status === 200, `GET /posts/:id retorna 200`);
    const postDetailData = await postDetailRes.json();
    assert(postDetailData.id === post1.id, 'ID da publicação corresponde');
    assert(postDetailData.author.username === userA.user.username, 'Autor detalhado corresponde');

    // 1º Comentário Raiz (Usuário B comenta no Post 1)
    const rootCommentRes = await fetch(`${baseUrl}/posts/${post1.id}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userB.token}`,
      },
      body: JSON.stringify({
        content: 'Ótima iniciativa para os laboratórios!',
      }),
    });
    assert(rootCommentRes.status === 201, `Comentário raiz criado com status 201`);
    const rootComment = await rootCommentRes.json();
    assert(rootComment.parentId === null, 'Comentário raiz possui parentId nulo');

    // 2º Resposta Encadeada Nível 1 (Usuário A responde ao comentário de Usuário B)
    const reply1Res = await fetch(`${baseUrl}/posts/${post1.id}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userA.token}`,
      },
      body: JSON.stringify({
        content: 'Obrigado! A bancada já está pronta para uso.',
        parentId: rootComment.id,
      }),
    });
    assert(reply1Res.status === 201, `Resposta encadeada criada com status 201`);
    const reply1 = await reply1Res.json();
    assert(reply1.parentId === rootComment.id, `parentId aponta para o comentário raiz`);

    // 3º Resposta Encadeada Nível 2 (Usuário B faz réplica ao comentário de Usuário A)
    const reply2Res = await fetch(`${baseUrl}/posts/${post1.id}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userB.token}`,
      },
      body: JSON.stringify({
        content: 'Perfeito, vou testar hoje à tarde.',
        parentId: reply1.id,
      }),
    });
    assert(reply2Res.status === 201, `Réplica de nível 2 criada com status 201`);
    const reply2 = await reply2Res.json();
    assert(reply2.parentId === reply1.id, `parentId aponta para a resposta de nível 1`);

    // Obter árvore completa de comentários
    const commentsTreeRes = await fetch(`${baseUrl}/posts/${post1.id}/comments`);
    assert(commentsTreeRes.status === 200, `GET /posts/:id/comments retorna 200`);
    const commentsTree = await commentsTreeRes.json();
    assert(commentsTree.length === 1, 'Árvore possui 1 comentário raiz');
    assert(commentsTree[0].replies.length === 1, 'Comentário raiz possui 1 réplica aninhada');
    assert(commentsTree[0].replies[0].replies.length === 1, 'Réplica possui 1 tréplica aninhada (nível 2)');
    assert(
      commentsTree[0].replies[0].replies[0].content === 'Perfeito, vou testar hoje à tarde.',
      'Conteúdo da tréplica encadeada correto'
    );

    console.log(`\n🏁 Resultado da Verificação: ${passed} passaram, ${failed} falharam.`);
    if (failed > 0) process.exit(1);
  } finally {
    server.close();
    process.exit(0);
  }
}

verifyStage6().catch((err) => {
  console.error('Erro na verificação da Etapa 6:', err);
  process.exit(1);
});
