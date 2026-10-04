# Déploiement Kubernetes — cm2.mous.ovh

Cluster MicroK8s, ingress Traefik + Gateway API (`ingress/traefik-gateway`, IP MetalLB 192.168.1.221), certificats cert-manager `letsencrypt-prod`.

## Première installation
```bash
# 1. Sauvegarde de la Gateway partagée (obligatoire avant modification)
kubectl get gateway traefik-gateway -n ingress -o yaml > gateway-backup-$(date +%Y%m%d-%H%M%S).yaml
# 2. Application, namespace, certificat, route
kubectl apply -f deploy/app.yaml
# 3. Listener HTTPS cm2.mous.ovh sur la Gateway
kubectl patch gateway traefik-gateway -n ingress --type=json --patch-file deploy/gateway-listener-patch.json
```

## Mise à jour
L'image `ghcr.io/mecmus/revisions-cm2:main` est reconstruite à chaque merge sur `main` :
```bash
kubectl rollout restart deploy/revisions-cm2 -n revisions-cm2
kubectl rollout status deploy/revisions-cm2 -n revisions-cm2
```

## Retour arrière
```bash
kubectl rollout undo deploy/revisions-cm2 -n revisions-cm2
# Retrait complet : restaurer la Gateway depuis la sauvegarde puis
kubectl delete ns revisions-cm2
```

## Recette — https://cm2-rec.mous.ovh
Suit la branche `develop` (image `:develop`). **Mise à jour en pull** : le CronJob `image-updater`
(toutes les 2 min) compare le digest GHCR de `:develop` à l'annotation `cm2/digest` du Deployment et
redémarre si besoin. GitHub n'a aucun accès au cluster ; le CronJob n'a que `get/patch` sur ce seul Deployment.
```bash
kubectl get gateway traefik-gateway -n ingress -o yaml > gateway-backup-$(date +%Y%m%d-%H%M%S).yaml
kubectl apply -f deploy/recette/app.yaml
kubectl patch gateway traefik-gateway -n ingress --type=json --patch-file deploy/recette/gateway-listener-patch.json
kubectl logs -n revisions-cm2-rec job/$(kubectl get jobs -n revisions-cm2-rec -o name | tail -1 | cut -d/ -f2)
```
