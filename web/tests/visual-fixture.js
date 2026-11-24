'use strict';
// Fixture solo para pruebas visuales locales: refleja la fila real de Ubrique
// verificada en Supabase el 24/11/2026. No se usa en producción.
(()=>{
  const DOC='https://www.bopcadiz.es/export/sites/default/.boletines_pdf/2026/11_noviembre/BOP225_23-11-26.pdf';
  const BASE='https://www.bopcadiz.es/.boletines_pdf/2026/09_septiembre/BOP174_09-09-26.pdf';
  const BOE='https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-20059';
  const row={id:'OPO-2026-36643646',published:true,estado_validacion:'aprobado',reviewed_at:'2026-11-24',
    municipio:'Ubrique',provincia:'Cádiz',canonical_url:DOC,
    data:{id:'OPO-2026-36643646',state:'lists',processStatus:'provisional_admissions',
      applicationStatus:'closed',lastEventType:'lista_provisional',originalCandidateId:'CAN-20261010-UBR-DIN',
      processType:'opposition',title:'Dinamizador/a de Programas, Proyectos y Eventos · 1 plaza',
      organism:'Ayuntamiento de Ubrique',places:1,publishedOn:'2026-09-09',boePublishedOn:'2026-09-28',
      reviewedOn:'2026-11-24',url:BASE,boeUrl:BOE,officialBulletin:'BOP de Cádiz',
      source_reference:'BOP Cádiz 225 · 405.377',location:'Ubrique (Cádiz)',municipio:'Ubrique',
      qualificationFilter:'bach',period:'Plazo de inscripción cerrado. Lista provisional de admitidos y excluidos publicada en el BOP de 23/11/2026; 10 días hábiles para subsanación en los términos del anuncio y del tablón municipal.',
      milestones:{lists:{text:'Lista provisional de personas admitidas y excluidos. Diez días hábiles de subsanación desde la publicación oficial; comprobar tablón electrónico municipal.',
        url:DOC,publishedOn:'2026-11-23',approved:true,publicado:true,publicationStatus:'approved'}}}};
  const dbEvents=[{evento_id:'EVT-37C8A41C',convocatoria_id:'OPO-2026-36643646',
    tipo_evento:'lista_provisional',
    titulo_evento:'Lista provisional de personas admitidas y excluidas · Dinamizador/a · Ubrique',
    fecha_oficial:'2026-11-23',url_evento:DOC,resumen:'BOP Cádiz 225 · anuncio 405.377',
    publicado:true,estado_validacion:'aprobado',retirado_en:null}];
  window.OpoAccountReady=Promise.resolve();
  window.OpoAccount={get:()=>null,save:async()=>true};
  window.OpoData.loadOpportunities=async()=>({source:'supabase',reviewedOn:'2026-11-24',notice:'',
    opportunities:[window.OpoData.normalize(row,dbEvents)]});
})();
