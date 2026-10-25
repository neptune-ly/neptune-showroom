// Tiny i18n helper: T("English","Français","العربية"). Digits stay Western (0-9) in every language. Everything is invented.
(function () {
  window.LANGS = { en: "English", fr: "Français", ar: "العربية" };
  window.T = function (en, fr, ar) {
    const l = (window.NX && NX.S && NX.S.lang) || "en";
    return l === "fr" ? (fr == null ? en : fr) : l === "ar" ? (ar == null ? en : ar) : en;
  };
  const W = {
    name: ["Name", "Nom", "الاسم"], status: ["Status", "Statut", "الحالة"], amount: ["Amount", "Montant", "المبلغ"], date: ["Date", "Date", "التاريخ"],
    type: ["Type", "Type", "النوع"], ref: ["Reference", "Référence", "المرجع"], search: ["Search", "Rechercher", "بحث"], all: ["All", "Tous", "الكل"],
    save: ["Save", "Enregistrer", "حفظ"], cancel: ["Cancel", "Annuler", "إلغاء"], confirm: ["Confirm", "Confirmer", "تأكيد"], close: ["Close", "Fermer", "إغلاق"],
    next: ["Continue", "Continuer", "متابعة"], back: ["Back", "Retour", "رجوع"], approve: ["Approve", "Approuver", "موافقة"], reject: ["Reject", "Rejeter", "رفض"],
    view: ["View", "Voir", "عرض"], edit: ["Edit", "Modifier", "تعديل"], export: ["Export", "Exporter", "تصدير"], download: ["Download", "Télécharger", "تنزيل"],
    from: ["From", "De", "من"], to: ["To", "Vers", "إلى"], total: ["Total", "Total", "الإجمالي"], fee: ["Fee", "Frais", "الرسوم"], reason: ["Reason", "Motif", "السبب"],
    balance: ["Balance", "Solde", "الرصيد"], account: ["Account", "Compte", "الحساب"], accounts: ["Accounts", "Comptes", "الحسابات"], currency: ["Currency", "Devise", "العملة"],
    beneficiary: ["Beneficiary", "Bénéficiaire", "المستفيد"], purpose: ["Purpose", "Objet", "الغرض"], maker: ["Maker", "Initiateur", "المُنشئ"], checker: ["Checker", "Valideur", "المراجع"],
    inflow: ["Inflow", "Entrées", "الداخل"], outflow: ["Outflow", "Sorties", "الخارج"], net: ["Net", "Net", "الصافي"], forecast: ["Forecast", "Prévision", "التوقع"],
    today: ["Today", "Aujourd’hui", "اليوم"], none: ["Nothing to show.", "Rien à afficher.", "لا يوجد ما يُعرض."], more: ["Show more", "Afficher plus", "عرض المزيد"],
    new: ["New", "Nouveau", "جديد"], add: ["Add", "Ajouter", "إضافة"], retry: ["Retry", "Réessayer", "إعادة المحاولة"], clone: ["Clone", "Dupliquer", "نسخ"],
    submit: ["Submit for approval", "Envoyer pour validation", "إرسال للموافقة"], sim: ["Simulated action — nothing leaves this demonstration.", "Action simulée — rien ne quitte cette démonstration.", "إجراء محاكى — لا يغادر شيء هذا العرض."],
    items: ["items", "éléments", "عناصر"], rows: ["rows", "lignes", "صفوف"], user: ["User", "Utilisateur", "المستخدم"], role: ["Role", "Rôle", "الدور"],
    look: ["Bank look", "Habillage banque", "هوية البنك"], time: ["Time", "Heure", "الوقت"], action: ["Action", "Action", "الإجراء"], details: ["Details", "Détails", "التفاصيل"], filter: ["Filter", "Filtrer", "تصفية"]
  };
  window.w = k => T.apply(null, W[k] || [k, k, k]);
  const ST = {
    completed: ["Completed", "Terminé", "مكتمل", "ok"], executed: ["Executed", "Exécuté", "نُفّذ", "ok"], pending: ["Pending approval", "En attente de validation", "بانتظار الموافقة", "warn"],
    failed: ["Failed", "Échoué", "فشل", "bad"], active: ["Active", "Actif", "نشط", "ok"], approved: ["Approved", "Approuvé", "تمت الموافقة", "ok"], rejected: ["Rejected", "Rejeté", "مرفوض", "bad"],
    draft: ["Draft", "Brouillon", "مسودة", ""], scheduled: ["Scheduled", "Planifié", "مجدول", "info"], processing: ["Processing", "En traitement", "قيد المعالجة", "info"],
    queued: ["Queued", "En file", "في الانتظار", "info"], ready: ["Ready", "Prêt", "جاهز", "ok"], valid: ["Valid", "Valide", "صالح", "ok"], invalid: ["Needs fix", "À corriger", "يحتاج تصحيحاً", "bad"],
    warning: ["Warning", "Alerte", "تنبيه", "warn"], connected: ["Connected", "Connecté", "متصل", "ok"], disconnected: ["Not connected", "Non connecté", "غير متصل", "" ],
    suspended: ["Suspended", "Suspendu", "موقوف", "warn"], invited: ["Invited", "Invité", "مدعو", "info"], open: ["Open", "Ouvert", "مفتوح", "info"], paid: ["Paid", "Payé", "مدفوع", "ok"],
    overdue: ["Overdue", "En retard", "متأخر", "bad"], expiring: ["Expiring", "Expire bientôt", "ينتهي قريباً", "warn"], cancelled: ["Cancelled", "Annulé", "ملغى", ""],
    partial: ["Partly executed", "Partiellement exécuté", "منفّذ جزئياً", "warn"], low: ["Low", "Faible", "منخفض", "ok"], medium: ["Medium", "Moyen", "متوسط", "warn"], high: ["High", "Élevé", "مرتفع", "bad"]
  };
  window.ST = ST;
  window.stLabel = s => ST[s] ? T(ST[s][0], ST[s][1], ST[s][2]) : s;
  const MON = { en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], fr: ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."], ar: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"] };
  const DOW = { en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], fr: ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."], ar: ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"] };
  window.MON = () => MON[(NX.S && NX.S.lang) || "en"]; window.DOW = () => DOW[(NX.S && NX.S.lang) || "en"];
  // Fixed demo clock: Sunday 25 October 2026, 09:41.
  window.NOW = new Date(2026, 9, 25, 9, 41);
  window.addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  window.fdate = (d, o) => { d = new Date(d); return `${d.getDate()} ${MON[NX.S.lang][d.getMonth()]}${o === "y" ? " " + d.getFullYear() : ""}`; };
  window.ftime = d => { d = new Date(d); return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; };
})();
