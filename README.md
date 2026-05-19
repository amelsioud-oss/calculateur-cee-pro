# 🧮 Calculateur CEE Pro

Outil de chiffrage des primes CEE (Certificats d'Économies d'Énergie) pour artisans RGE.

---

## 🚀 Déploiement sur Vercel — Guide pas à pas

### Étape 1 — Créer un compte GitHub (gratuit)
1. Aller sur https://github.com
2. Cliquer "Sign up" et créer votre compte
3. Vérifier votre email

### Étape 2 — Mettre le projet sur GitHub
1. Sur GitHub, cliquer le "+" en haut à droite → "New repository"
2. Nom : `calculateur-cee-pro`
3. Laisser "Public" coché (nécessaire pour Vercel gratuit)
4. Cliquer "Create repository"
5. Suivre les instructions "upload an existing file" pour déposer tous les fichiers de ce dossier

### Étape 3 — Créer un compte Vercel (gratuit)
1. Aller sur https://vercel.com
2. Cliquer "Sign Up" → choisir "Continue with GitHub"
3. Autoriser Vercel à accéder à votre GitHub

### Étape 4 — Déployer
1. Sur Vercel, cliquer "Add New Project"
2. Sélectionner votre repository `calculateur-cee-pro`
3. Laisser tous les paramètres par défaut (Vercel détecte React automatiquement)
4. Cliquer "Deploy"
5. ✅ Votre app est en ligne sur `calculateur-cee-pro.vercel.app` en 2-3 minutes !

### Étape 5 — Nom de domaine personnalisé (optionnel, ~10€/an)
1. Acheter un domaine sur https://www.ovhcloud.com (ex: `calculateur-cee-pro.fr`)
2. Dans Vercel → Settings → Domains → ajouter votre domaine
3. Suivre les instructions DNS fournies par Vercel

---

## 🔧 Faire évoluer l'application

### Modifier les forfaits cumac
Ouvrir `src/App.jsx` et modifier les valeurs dans la constante `OPERATIONS` en haut du fichier.

### Ajouter une nouvelle fiche CEE
Dans `OPERATIONS`, copier une fiche existante et adapter :
- Le code (ex: `"BAR-TH-137"`)
- Le label, l'unité, les forfaits cumac H1/H2/H3
- Les critères si applicable

### Modifier les plafonds de revenus
Modifier la constante `PLAFONDS_CEE` avec les nouvelles valeurs de l'arrêté en vigueur.

---

## 📦 Structure du projet

```
calculateur-cee-pro/
├── public/
│   └── index.html          # Page HTML principale
├── src/
│   ├── index.js            # Point d'entrée React
│   └── App.jsx             # Application complète
├── package.json            # Dépendances du projet
├── vercel.json             # Configuration déploiement
└── README.md               # Ce fichier
```

---

## 💡 Technologies utilisées

- **React 18** — Interface utilisateur
- **JavaScript ES6+** — Logique de calcul
- **CSS-in-JS** — Styles intégrés (pas de dépendance externe)

---

## ⚠️ Mises à jour réglementaires

Les forfaits kWh cumac sont issus des fiches officielles disponibles sur :
https://www.ecologie.gouv.fr/politiques-publiques/economies-denergie-cee

Penser à vérifier régulièrement les nouvelles versions des fiches (les versions sont indiquées dans le code, ex: `vA64-6`).

---

## 📞 Support

Pour toute évolution ou correction, les modifications peuvent être apportées
directement dans `src/App.jsx` avec l'aide de Claude (claude.ai).
