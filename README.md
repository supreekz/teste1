# Modo: cuidar da Ju 🤍

Um mini-site single-page carinhoso e interativo inspirado no visual de Stranger Things, criado para a Ju durante a recuperação da dengue.

## 🎨 Características

- **Visual Stranger Things**: Estética anos 80 com efeitos VHS, glitch sutil, neon vermelho e tipografia dramática
- **Checklist de cuidados**: Lista suave e acolhedora sem pressão
- **Mensagens de carinho**: Cartas reveladas por interação
- **Boss Fight**: Animação 3D elaborada com Three.js de um mosquito cartunesco sendo derrotado
- **Mobile-first**: Otimizado para celular, mas bonito no desktop também
- **Performance**: Código leve e otimizado, Three.js carregado de forma preguiçosa

## 🚀 Como executar

### Pré-requisitos

- Node.js 18+ e npm/yarn instalados

### Instalação e execução

1. Instale as dependências:
```bash
npm install
```

2. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

3. Abra o navegador no endereço indicado (geralmente `http://localhost:3000`)

### Build para produção

```bash
npm run build
```

Os arquivos serão gerados na pasta `dist/`.

## 📝 Personalização

### Editar textos

Os textos principais estão no arquivo `index.html`:

- **Título principal**: Linha 12 - `<h1 class="title glitch">`
- **Subtítulo**: Linha 13 - `<p class="subtitle">`
- **Checklist**: Linhas 25-40 - `.checklist-item`
- **Mensagens de carinho**: Linhas 44-60 - `.message-card` (atributo `data-message`)
- **Mensagem do Boss Fight**: Linha 68 - texto do botão

### Editar cores

As cores estão definidas no arquivo `src/styles.css`, na seção `:root` (linhas 9-15):

```css
:root {
  --neon-red: #ff0033;           /* Cor principal neon */
  --neon-red-bright: #ff3366;    /* Neon mais brilhante */
  --neon-red-dim: #cc0026;       /* Neon mais escuro */
  --bg-dark: #0a0a0a;            /* Fundo escuro */
  --bg-darker: #050505;          /* Fundo mais escuro */
  --text-light: #f5f5f5;         /* Texto claro */
  --text-dim: #b0b0b0;           /* Texto secundário */
}
```

### Ajustar animações

- **Glitch no título**: `src/styles.css` - `@keyframes glitch-smooth` e `glitch-anim`
- **Velocidade das transições**: Procure por `transition` e `animation` no CSS
- **Animação do mosquito**: `src/three/mosquitoScene.ts` - função `animate()` e `triggerDefeat()`

## 🏗️ Estrutura do projeto

```
.
├── index.html              # HTML principal
├── src/
│   ├── main.ts            # Ponto de entrada
│   ├── styles.css         # Estilos (visual Stranger Things)
│   ├── ui.ts              # Lógica de UI e estados
│   └── three/
│       └── mosquitoScene.ts  # Cena 3D do mosquito (Three.js)
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 🎮 Funcionalidades

1. **Tela inicial**: Glitch sutil no título, botão "DAR PLAY" com efeito neon
2. **Checklist**: Itens clicáveis sem pressão, marcando quando completados
3. **Mensagens**: Cartas que revelam mensagens de carinho ao clicar
4. **Boss Fight**: Botão que dispara animação 3D do mosquito sendo derrotado, com partículas e efeitos cinematográficos

## ⚙️ Tecnologias

- **Vite**: Build tool rápido
- **TypeScript**: Tipagem estática
- **Three.js**: Renderização 3D do mosquito
- **CSS Vanilla**: Animações e estilos (sem frameworks pesados)
- **Web Audio API**: Som de impacto simples (beep)

## 📱 Compatibilidade

- ✅ Chrome/Edge (recomendado)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile (iOS Safari, Chrome Mobile)

## 💡 Notas

- O Three.js é carregado apenas quando necessário (lazy-load) para melhor performance
- Respeita `prefers-reduced-motion` para acessibilidade
- Todos os botões são grandes e acessíveis para uso no celular
- A animação do mosquito é otimizada com low-poly geometry e iluminação simples

## 🚀 Deploy no GitHub Pages

### Opção 1: Deploy Automático (Recomendado)

1. **Crie um repositório no GitHub** (ex: `dengue`)

2. **Ajuste o base path no `vite.config.ts`**:
   - Se o repositório for `dengue`, o base já está configurado como `/dengue/`
   - Se for outro nome, altere: `base: '/nome-do-seu-repo/'`

3. **Faça push do código**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/dengue.git
   git push -u origin main
   ```

4. **Configure o GitHub Pages**:
   - Vá em Settings → Pages
   - Source: selecione "GitHub Actions"
   - O workflow `.github/workflows/deploy.yml` fará o deploy automaticamente

5. **Aguarde o deploy** (alguns minutos) e acesse: `https://SEU-USUARIO.github.io/dengue/`

### Opção 2: Deploy Manual

1. **Build do projeto**:
   ```bash
   npm run build
   ```

2. **Ajuste o base path** no `vite.config.ts` para o nome do seu repositório

3. **Faça push da pasta `dist`**:
   ```bash
   git subtree push --prefix dist origin gh-pages
   ```
   
   Ou configure o GitHub Pages para usar a branch `gh-pages` com a pasta `dist`

### ⚠️ Importante

- **Base Path**: Se o repositório não for `dengue`, ajuste o `base` no `vite.config.ts`
- **Arquivos estáticos**: Todos os arquivos (imagens, áudios, modelos 3D) devem estar na raiz do projeto para serem servidos corretamente
- **Primeiro deploy**: Pode levar alguns minutos para o GitHub Pages ficar disponível

---

Feito com carinho 💝
