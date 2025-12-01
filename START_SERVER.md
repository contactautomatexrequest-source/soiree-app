# Guide de démarrage du serveur

## Commandes à exécuter

1. **Ouvrir un terminal** dans le dossier du projet

2. **Lancer le serveur de développement** :
   ```bash
   pnpm dev
   ```

3. **Attendre le message de confirmation** :
   ```
   ✓ Ready in XXXms
   - Local:    http://localhost:3000
   - Network:   http://192.168.1.11:3000
   ```

4. **Ouvrir votre navigateur** sur :
   - http://localhost:3000

## Si le serveur ne démarre pas

1. Vérifier que Node.js est installé :
   ```bash
   node --version
   ```

2. Vérifier que pnpm est installé :
   ```bash
   pnpm --version
   ```

3. Installer les dépendances si nécessaire :
   ```bash
   pnpm install
   ```

4. Nettoyer le cache et redémarrer :
   ```bash
   rm -rf .next
   pnpm dev
   ```

## URLs importantes

- Page d'accueil : http://localhost:3000
- Création de compte : http://localhost:3000/sign-up
- Connexion : http://localhost:3000/sign-in
