/* LPDB — configurações do site. Edite apenas os valores; mantenha as aspas e vírgulas. */
window.LPDB_CONFIG = {
  instagram: {
    url: "https://www.instagram.com/deyselupas?exln=Yzhqa2JvcXFtM2Vj"
  },

  // Grupo de novidades e promoções
  grupoWhatsapp: "https://chat.whatsapp.com/J1fOBAEf64T6e6kY1jvm9u",

  // WhatsApp comercial da loja — AINDA NÃO INFORMADO.
  // Formato: DDI + DDD + número, só dígitos. Ex.: "5592999999999"
  // Enquanto for null, os botões de contato aparecem como "em breve".
  whatsappLoja: {
    numero: null
  },

  // Localização — AINDA NÃO INFORMADA.
  loja: {
    endereco: null,   // ex.: "Rua Exemplo, 123 — Bairro, Cidade/UF"
    horario: null,    // ex.: "Seg a Sáb, 9h às 18h"
    linkMapa: null,   // link do Google Maps (botão "Como chegar")
    embedMapa: null   // endereço do iframe (Google Maps > Compartilhar > Incorporar um mapa)
  },

  // Mensagem enviada ao WhatsApp a partir de cada produto.
  // {nome} e {codigo} são preenchidos automaticamente.
  mensagemWhatsapp: "Olá! Tenho interesse no modelo {nome} (código {codigo}). Poderia me passar mais informações?"
};
