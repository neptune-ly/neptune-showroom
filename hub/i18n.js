// Tiny i18n helper. Strings live next to the screens that use them: T("English","Français","العربية").
// Digits stay Western (0-9) in every language. All content in this console is invented.
(function () {
  window.LANGS = { en: "English", fr: "Français", ar: "العربية" };
  window.T = function (en, fr, ar) {
    const l = (window.NX && NX.S && NX.S.lang) || "en";
    return l === "fr" ? (fr == null ? en : fr) : l === "ar" ? (ar == null ? en : ar) : en;
  };
  // Shared vocabulary: key -> [en, fr, ar]
  const W = {
    name: ["Name", "Nom", "الاسم"], status: ["Status", "Statut", "الحالة"], amount: ["Amount", "Montant", "المبلغ"], date: ["Date", "Date", "التاريخ"],
    type: ["Type", "Type", "النوع"], ref: ["Reference", "Référence", "المرجع"], customer: ["Customer", "Client", "العميل"], search: ["Search", "Rechercher", "بحث"],
    all: ["All", "Tous", "الكل"], save: ["Save", "Enregistrer", "حفظ"], cancel: ["Cancel", "Annuler", "إلغاء"], confirm: ["Confirm", "Confirmer", "تأكيد"],
    close: ["Close", "Fermer", "إغلاق"], next: ["Next", "Suivant", "التالي"], back: ["Back", "Retour", "السابق"], approve: ["Approve", "Approuver", "موافقة"],
    reject: ["Reject", "Rejeter", "رفض"], view: ["View", "Voir", "عرض"], edit: ["Edit", "Modifier", "تعديل"], export: ["Export", "Exporter", "تصدير"],
    time: ["Time", "Heure", "الوقت"], user: ["User", "Utilisateur", "المستخدم"], role: ["Role", "Rôle", "الدور"], owner: ["Owner", "Responsable", "المسؤول"],
    product: ["Product", "Produit", "المنتج"], channel: ["Channel", "Canal", "القناة"], branch: ["Branch", "Agence", "الفرع"], card: ["Card", "Carte", "البطاقة"],
    details: ["Details", "Détails", "التفاصيل"], actions: ["Actions", "Actions", "الإجراءات"], overview: ["Overview", "Vue d’ensemble", "نظرة عامة"],
    from: ["From", "De", "من"], to: ["To", "Vers", "إلى"], total: ["Total", "Total", "الإجمالي"], fee: ["Fee", "Frais", "الرسوم"], reason: ["Reason", "Motif", "السبب"],
    inbound: ["Inbound", "Entrant", "وارد"], outbound: ["Outbound", "Sortant", "صادر"], today: ["Today", "Aujourd’hui", "اليوم"], none: ["Nothing to show.", "Rien à afficher.", "لا يوجد ما يُعرض."],
    created: ["Created", "Créé", "أُنشئ"], updated: ["Updated", "Mis à jour", "حُدّث"], priority: ["Priority", "Priorité", "الأولوية"], notes: ["Notes", "Notes", "ملاحظات"],
    enabled: ["Enabled", "Activé", "مفعّل"], limit: ["Limit", "Plafond", "الحد"], count: ["Count", "Nombre", "العدد"], risk: ["Risk", "Risque", "المخاطر"],
    submit: ["Submit", "Envoyer", "إرسال"], download: ["Download", "Télécharger", "تنزيل"], run: ["Run", "Lancer", "تشغيل"], add: ["Add", "Ajouter", "إضافة"], more: ["Show more", "Afficher plus", "عرض المزيد"],
    sentForApproval: ["Sent for approval (maker–checker).", "Envoyé pour validation (quatre yeux).", "أُرسل للموافقة (المنفّذ والمراجع)."],
    simulated: ["Simulated action — nothing leaves this demonstration.", "Action simulée — rien ne quitte cette démonstration.", "إجراء محاكى — لا يغادر شيء هذا العرض."]
  };
  window.w = k => T.apply(null, W[k] || [k, k, k]);
  // Status vocabulary
  const ST = {
    completed: ["Completed", "Terminé", "مكتمل", "ok"], pending: ["Pending", "En attente", "معلّق", "warn"], failed: ["Failed", "Échoué", "فشل", "bad"],
    active: ["Active", "Actif", "نشط", "ok"], frozen: ["Frozen", "Gelé", "مجمّد", "info"], blocked: ["Blocked", "Bloqué", "محظور", "bad"],
    verified: ["Verified", "Vérifié", "موثّق", "ok"], review: ["In review", "En revue", "قيد المراجعة", "warn"], expired: ["Expired", "Expiré", "منتهٍ", "bad"],
    approved: ["Approved", "Approuvé", "تمت الموافقة", "ok"], rejected: ["Rejected", "Rejeté", "مرفوض", "bad"], open: ["Open", "Ouvert", "مفتوح", "warn"],
    closed: ["Closed", "Clos", "مغلق", ""], reversed: ["Reversed", "Annulé", "معكوس", "info"], exception: ["Exception", "Exception", "استثناء", "bad"],
    up: ["Operational", "Opérationnel", "تعمل", "ok"], degraded: ["Degraded", "Dégradé", "أداء منخفض", "warn"], down: ["Down", "Hors service", "متوقفة", "bad"],
    low: ["Low", "Faible", "منخفض", "ok"], medium: ["Medium", "Moyen", "متوسط", "warn"], high: ["High", "Élevé", "مرتفع", "bad"], critical: ["Critical", "Critique", "حرج", "bad"],
    new: ["New", "Nouveau", "جديد", "info"], triage: ["Triage", "Tri", "فرز", "warn"], investigating: ["Investigating", "Enquête", "قيد التحقيق", "warn"], escalated: ["Escalated", "Escaladé", "مُصعّد", "bad"],
    draft: ["Draft", "Brouillon", "مسودة", ""], sent: ["Sent", "Envoyé", "مُرسل", "info"], paid: ["Paid out", "Payé", "تم الصرف", "ok"], held: ["On hold", "En attente", "موقوف", "warn"],
    cancelled: ["Cancelled", "Annulé", "ملغى", ""], shadow: ["Shadow", "Observation", "مراقبة", "info"], disabled: ["Disabled", "Désactivé", "معطّل", ""],
    on: ["On", "Activé", "يعمل", "ok"], off: ["Off", "Désactivé", "متوقف", ""], pass: ["Pass", "Réussi", "ناجح", "ok"], fail: ["Fail", "Échec", "فشل", "bad"], suspect: ["Suspect", "Suspect", "مشتبه", "warn"],
    matched: ["Matched", "Rapproché", "مطابق", "ok"], unmatched: ["Unmatched", "Non rapproché", "غير مطابق", "bad"], scheduled: ["Scheduled", "Planifié", "مجدول", "info"],
    ready: ["Ready", "Prêt", "جاهز", "ok"], running: ["Running", "En cours", "قيد التشغيل", "info"], resolved: ["Resolved", "Résolu", "تم الحل", "ok"],
    suspended: ["Suspended", "Suspendu", "معلّق الاستخدام", "warn"], deleted: ["Deleted", "Supprimé", "محذوف", ""], won: ["Won", "Gagné", "لصالحنا", "ok"], lost: ["Lost", "Perdu", "خسارة", "bad"],
    live: ["Live", "En production", "مباشر", "ok"], sandbox: ["Sandbox", "Bac à sable", "تجريبي", "info"], valid: ["Valid", "Valide", "صالح", "ok"], expiring: ["Expiring", "Expire bientôt", "ينتهي قريباً", "warn"]
  };
  window.ST = ST;
  window.stLabel = s => ST[s] ? T(ST[s][0], ST[s][1], ST[s][2]) : s;
})();
