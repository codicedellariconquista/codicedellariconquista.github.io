/* Quiz Reconquista IT: perguntas, fases e notas.
   Usado por /quiz/ (perguntas + resultado).
   Copy it-IT (R1 a R8 e botão) aplicada da bozza do Copywriter; NON revisionata da madrelingua. */
window.RQ_QUIZ = (function () {
  var QS = [
    {k:'tempo',t:'Da quanto tempo vi siete lasciati?',h:'Scegli l\'opzione più vicina.',o:[
      ['menos2','clock','Meno di 2 settimane'],['2s2m','calendar','Tra 2 settimane e 2 mesi'],['2a6m','calendar-days','Tra 2 e 6 mesi'],['mais6','hourglass','Più di 6 mesi']]},
    {k:'quem',t:'Chi ha chiuso la relazione?',h:'Questo cambia il punto di partenza.',o:[
      ['ela','heart-crack','Mi ha lasciato lei'],['eu','hand','L\'ho lasciata io e me ne sono pentito'],['acordo','handshake','L\'abbiamo deciso insieme'],['indef','circle-question-mark','Non è stato chiaro / ci siamo presi una pausa']]},
    {k:'contato',t:'Com\'è il contatto tra voi oggi?',h:'Pensa alle ultime 2 settimane.',o:[
      ['normal','message-circle','Parliamo normalmente, a volte mi scrive lei'],['seco','message-circle-dashed','Mi risponde, ma in modo breve e freddo'],['visualiza','eye','Visualizza e non risponde (o ci mette giorni)'],['nada','volume-x','Non ci sentiamo più']]},
    {k:'bloqueio',t:'Ti ha bloccato da qualche parte?',h:'WhatsApp, Instagram, Facebook, telefono…',o:[
      ['tudo','ban','Sì, ovunque'],['algum','circle-slash','Sì, in uno o due posti'],['desbloqueou','lock-open','Mi aveva bloccato, ma poi mi ha sbloccato'],['nao','circle-check','No, non mi ha bloccato']]},
    {k:'motivo',t:'Cosa ha pesato di più nella rottura?',h:'Se sono state più cose, scegli la principale.',o:[
      ['brigas','zap','Litigi e logoramento'],['erro','gem','Un tradimento o un mio errore'],['sentimento','flower-2','Mi ha detto che non prova più lo stesso'],['outro','user','Sta (o sembra stare) con un\'altra persona'],['rotina','timer','Distanza, routine, mancanza di tempo']]},
    {k:'objetivo',t:'Cosa vuoi adesso?',h:'Sii sincero: non esiste una risposta giusta.',o:[
      ['voltar','heart','Riconquistarla e tornare insieme'],['reabrir','messages-square','Riaprire il dialogo con rispetto'],['chance','search','Capire se c\'è ancora una possibilità'],['paz','bird','Stare in pace, comunque vada']]}
  ];
  var FASES = {
    bloqueada:{n:'Bloccata',i:0,title:'Siete nella fase <span class="gold">Bloccata</span>',
      what:'Ha chiuso il canale. Di solito è il segno di un\'emozione molto forte (rabbia, ferita o bisogno di proteggersi) o del fatto che ha bisogno di distanza per andare avanti. Non è la fine di tutto, ma è un limite che va rispettato.',
      do:'Silenzio totale e lavoro su di te. È il momento della pausa con strategia, senza un calendario fisso. Se il contatto torna in modo naturale (ti sblocca, vi incontrate per caso), il primo messaggio deve essere breve, leggero e senza pretese.',
      dont:'Creare un altro profilo, mandarle messaggi tramite amici o parenti, presentarti sotto casa sua, commentare le foto di altre persone. Tutto questo le conferma che bloccarti è stata la scelta giusta.'},
    fria:{n:'Fredda',i:1,title:'Siete nella fase <span class="gold">Fredda</span>',
      what:'Non ti ha bloccato, ma si è chiusa. Il canale c\'è ancora, solo che è fragile: ogni messaggio sbagliato lo raffredda un po\' di più.',
      do:'Ridurre la pressione. Pochi messaggi, brevi, senza pretese e senza parlare della relazione. Un buon messaggio seguito dal silenzio vale più di dieci di fila.',
      dont:'Chiederle "perché non mi rispondi?", mandare tanti messaggi di fila, papiri a notte fonda, aprire discussioni sulla relazione per messaggio.'},
    amigavel:{n:'Amichevole',i:2,title:'Siete nella fase <span class="gold">Amichevole</span>',
      what:'Ti parla, è gentile e a volte anche scherzosa. È la fase con più possibilità di riavvicinamento, e anche la più facile da rovinare per colpa dell\'ansia.',
      do:'Costruire conversazioni belle e brevi, senza fretta di "tornare insieme". Quando ci sono già state alcune conversazioni leggere, proporle un incontro semplice, con giorno e luogo, lasciandole una via d\'uscita facile.',
      dont:'Trasformare ogni conversazione in una discussione sulla relazione, chiederle di tornare insieme per messaggio, pretendere risposte o mostrarti geloso.'},
    outro:{n:'Con un altro',i:3,title:'Siete nella fase <span class="gold">Con un altro</span>',
      what:'Si sta frequentando con un\'altra persona. Questo cambia tutto: la priorità diventa il rispetto e la dignità, non la riconquista attiva.',
      do:'Fare un passo indietro ed essere una presenza tranquilla e matura, oppure nessuna presenza. Prenderti cura di te. Se è lei a scriverti, ci sono risposte giuste per non sembrare bisognoso né rancoroso.',
      dont:'Parlare male di lui, fare paragoni, cercare di farla ingelosire, scriverle quando sai che è con lui.'}
  };
  /* Lógica do modelo, igual: a ordem decide. */
  function fase(A) {
    if (A.motivo === 'outro') return 'outro';
    if (A.bloqueio === 'tudo' || A.bloqueio === 'algum') return 'bloqueada';
    if (A.contato === 'normal') return 'amigavel';
    return 'fria';
  }
  function notes(A, f) {
    var n = [];
    if (A.tempo === 'menos2') n.push('<strong>La rottura è molto recente.</strong> Qualunque sia la fase, prima di mandare qualsiasi messaggio prenditi una pausa e lavora su di te: non esiste un numero magico di giorni.');
    if (A.bloqueio === 'desbloqueou') n.push('<strong>Ti ha già sbloccato.</strong> Questo richiede un solo messaggio leggero, senza chiederle perché ti aveva bloccato. Nel metodo trovi il modello del primo messaggio, da adattare con le tue parole, senza pressione.');
    if (A.motivo === 'erro') n.push('<strong>Dopo un tradimento o un tuo errore</strong> non esiste una frase magica: esistono responsabilità, pazienza e coerenza. Nel metodo trovi come assumerti la tua parte, che cosa non dire, e una sezione sul tradimento.');
    if (A.quem === 'eu') n.push('<strong>Sei stato tu a lasciarla.</strong> Lei può essere ferita o diffidente. Chiarezza e calma valgono più della fretta.');
    if (A.objetivo === 'paz') n.push('<strong>Vuoi stare in pace.</strong> Ottimo punto di partenza: il metodo comincia proprio da te, e ti serve sia per riavvicinarvi sia per andare avanti con dignità.');
    if (A.motivo === 'sentimento' && f !== 'outro') n.push('<strong>"Non provo più lo stesso"</strong> raramente cambia con le argomentazioni. Cambia con il tempo, una distanza sana e una versione più serena di te.');
    return n;
  }
  return { QS: QS, FASES: FASES, fase: fase, notes: notes };
})();
