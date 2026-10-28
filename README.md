# Aplicativo móvel com Ionic, Vue, Capacitor e Firebase

Aplicação de exemplo para Android, iOS e web. A interface usa Ionic Vue, o roteamento e estado da aplicação usam Vue 3, o Capacitor empacota a aplicação web como app nativo e o Firebase fornece autenticação, banco de dados e armazenamento.

## Pesquisa prática: conceitos e arquitetura

- **Ionic Framework** oferece componentes de interface adaptáveis a toque e padrões visuais de aplicativos. `@ionic/vue` integra esses componentes ao Vue.
- **Vue.js 3** organiza a interface em componentes e páginas `.vue`; Composition API e TypeScript mantêm estado e operações explícitos.
- **Capacitor** hospeda o build web em Android/iOS e fornece acesso a recursos nativos por plugins. O Firebase JS SDK usado neste exemplo roda na camada web do app.
- **Firebase Authentication** identifica o usuário e mantém a sessão. O app usa e-mail/senha, criação de conta, login e redefinição de senha.
- **Cloud Firestore** guarda os dados complementares em `profiles/{uid}`. O UID do Firebase Authentication é o identificador do documento.
- **Firebase Storage** guarda a imagem em `avatars/{uid}/profile`; o Firestore guarda o caminho, não o arquivo.

Fluxo principal:

```text
Login/Cadastro -> Firebase Authentication
                         |
                    uid do usuário
                    /            \
     Firestore profiles/{uid}   Storage avatars/{uid}/profile
                    \            /
                 Boas-vindas e perfil
```

O guard do Vue Router aguarda a inicialização da sessão e restringe `/welcome` e `/profile` a usuários autenticados. A tela de perfil lê e grava nome, nascimento, nickname e caminho da foto. O Firebase Storage recebe imagens JPEG, PNG, WebP ou GIF de até 5 MB. A tela inicial apresenta o nome/foto e permite acessar o perfil ou encerrar a sessão.

### Ferramentas utilizadas

- Node.js e npm para dependências e scripts.
- Ionic CLI (opcional) e `@ionic/vue` para desenvolvimento da interface.
- Vue 3, Vue Router, TypeScript e Vite para aplicação, navegação, tipos e servidor/build.
- Capacitor CLI, Android Studio e/ou Xcode para sincronizar, executar e empacotar a aplicação nativa.
- Firebase Console para criar o projeto, registrar o app web, ativar serviços e publicar regras.
- Firebase JavaScript SDK (`firebase`) para Auth, Firestore e Storage.

## Configuração prática

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/) e registre um aplicativo web. Copie os valores da configuração do SDK.
2. Ative **Authentication > Sign-in method > Email/Password**.
3. Crie o banco **Cloud Firestore** e o bucket **Storage**. Configure as regras usando [`firestore.rules`](./firestore.rules) e [`storage.rules`](./storage.rules).
4. Copie `.env.example` para `.env.local` e substitua os valores pelos da configuração do Firebase:

   ```dotenv
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=seu-projeto
   VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

   Os valores de configuração do SDK web identificam o projeto, mas não substituem regras de segurança. Não coloque credenciais de service account ou chaves privadas no app.
5. Para que o link enviado por **Authentication > Templates > Password reset** abra a tela de redefinição desta aplicação, configure no template um manipulador de ação personalizado publicado no domínio autorizado do app, apontando para `/update-password`. A rota precisa receber os parâmetros Firebase `mode=resetPassword` e `oobCode`; a tela valida o código e o aplica com `confirmPasswordReset`. Sem esse manipulador personalizado, o Firebase usará sua página padrão de redefinição.
6. Instale e execute:

   ```bash
   npm install
   npm run dev
   ```

7. Valide o build e os testes:

   ```bash
   npm run build
   npm run test:unit -- --run
   npm run lint
   ```

### Executar em dispositivos

Com o Android Studio instalado, sincronize o build e abra o projeto Android:

```bash
npm run build
npx cap sync android
npx cap open android
```

Para iOS, use macOS com Xcode:

```bash
npm run build
npx cap sync ios
npx cap open ios
```

Após alterar plugins nativos ou dependências, execute novamente `npx cap sync`. A autenticação por e-mail usa o fluxo web do Firebase; para que links de e-mail retornem diretamente ao app instalado, publique o manipulador personalizado e configure Universal Links (iOS) ou App Links (Android) e os respectivos esquemas/domínios no Firebase e no Capacitor.

## Estrutura e dados

- `src/lib/firebase.ts`: inicialização central do Firebase e acesso aos serviços.
- `src/lib/profile.ts`: operações tipadas de leitura/gravação no Firestore e resolução do avatar.
- `src/views/LoginPage.vue`: cadastro e login.
- `src/views/ResetPasswordPage.vue` e `src/views/UpdatePasswordPage.vue`: solicitação e confirmação de redefinição.
- `src/views/ProfilePage.vue`: edição do perfil e upload da foto.
- `src/views/WelcomePage.vue`: boas-vindas para a sessão autenticada.
- `firestore.rules` e `storage.rules`: autorização por UID e validações básicas de tamanho/tipo.

Documento `profiles/{uid}`:

```ts
{
  fullName: string,
  birthDate: string, // formato AAAA-MM-DD
  nickname: string,
  avatarPath: string | null,
  updatedAt: Timestamp
}
```

O caminho de armazenamento é `avatars/{uid}/profile`. Regras no cliente e validação de formulário melhoram a experiência, mas as regras do Firebase são a barreira de segurança efetiva. Uma URL de download do Storage é um link de acesso; evite compartilhá-la para arquivos que precisem de confidencialidade adicional.

## Alternativas e integrações Firebase

Esta aplicação usa Firebase Authentication, Cloud Firestore e Storage. Outras possibilidades para evoluir o produto incluem Firebase App Check para reduzir tráfego de clientes não legítimos, Analytics para eventos de uso, Crashlytics em projetos nativos que integrem os plugins correspondentes, Cloud Functions para operações confiáveis no servidor e Firebase Emulator Suite para testes locais integrados. Serviços ou SDKs adicionais devem ser habilitados apenas quando a necessidade do aplicativo justificar sua inclusão.
