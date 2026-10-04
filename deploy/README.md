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
