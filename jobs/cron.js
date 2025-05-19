import cron from 'node-cron';
import { markExpiredPublicites } from '../controller/publicitePack.js';

cron.schedule('0 2 * * *', () => {
  console.log(' [CRON] Vérification des publicités expirées...');
  markExpiredPublicites()
    .then(() => console.log(" [CRON] Tâche terminée."))
    .catch((err) => console.error(" [CRON] Erreur lors de la vérification :", err));
});
// cron.schedule('* * * * *', () => {
//   console.log(' [TEST] Vérification des publicités expirées...');
//   markExpiredPublicites()
//     .then(() => console.log(" [TEST] Tâche CRON exécutée avec succès"))
//     .catch((err) => console.error(" [TEST] Erreur dans la tâche CRON :", err));
// });
