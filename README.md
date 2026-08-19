# Telao

Uma alternativa simples ao Discord focada em compartilhar tela: salas por link, chat e conexões ponto a ponto por WebRTC.

## Rodar localmente

1. Instale o [Node.js LTS](https://nodejs.org/).
2. No diretório do projeto, execute `npm install`.
3. Execute `npm start`.
4. Abra `http://localhost:3000` em dois navegadores, crie uma sala e envie o convite.

## Recursos

- Criação e entrada em salas com códigos e links de convite
- Compartilhamento de tela com pedido de áudio do sistema quando o navegador o disponibiliza
- Chat em tempo real da sala
- Sinalização WebSocket e mídia WebRTC P2P
- Layout responsivo, inclusive para celular

## Produção: requisitos importantes

`getDisplayMedia` e WebRTC exigem **contexto seguro** fora de `localhost`: sirva o site por **HTTPS** e conecte o WebSocket por **WSS**. Coloque o Node atrás de um proxy reverso (Nginx, Caddy, Render, Railway etc.) que termine TLS.

O projeto vem com um servidor STUN público apenas para desenvolvimento. Para conexões confiáveis em redes corporativas, CGNAT ou firewalls restritos, configure um servidor **TURN** próprio (por exemplo, coturn) e troque `config.iceServers` em `public/app.js` por credenciais TURN protegidas. Não deixe credenciais de longa duração expostas no JavaScript; gere credenciais temporárias no servidor.

Este servidor mantém as salas em memória: reiniciar o processo desconecta participantes. Para escalar para múltiplas instâncias, use afinidade de sessão e um mecanismo compartilhado de sinalização/pub-sub.
