/* N0 — G5X-V1: G5 exhaustivo sobre TODAS las palabras (x0=0; el complemento cubre el resto). Claude, 2026-10-22.
   G5: emparejamiento inyectivo nivel bicolor h -> ventana desperdiciada w (convencion fo: su clase ya aparecio antes),
   con arista si existe t, S_t=h, |t-w| <= m+1. Falla G5 si need = I-delta-1 > 0 y emparejamiento maximo < need.
   Control positivo (CTL): mismo calculo con radio m (debe fallar en alguna palabra).
   THM: I > m+delta (equivale a rho > 3m+2) -> debe ser 0.
   Uso: g5x m shard nshards salida.txt     Compilado con -DPLANT: need = I-delta (falla plantada; debe producir fallas G5). */
#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>
#include "match.h"
int main(int argc,char**argv){
  if(argc<5){fprintf(stderr,"uso: g5x m shard nshards salida\n");return 2;}
  int m=atoi(argv[1]),sh=atoi(argv[2]),ns=atoi(argv[3]); int N=6*m+1,L=2*m+1,T=4*m+1;
  if(N>63||sh<0||sh>=ns){fprintf(stderr,"parametros\n");return 2;}
  uint64_t total=1ULL<<(N-1), lo=total/ns*sh, hi=(sh==ns-1)?total:total/ns*(sh+1);
  int og5[64],octl[64]; for(int q=0;q<=m+1;q++)og5[q]=q; for(int q=0;q<=m;q++)octl[q]=q;
  long long words=0,needpos=0,g5f=0,ctlf=0,thm=0,tight=0,needh[64]={0}; uint64_t g5w=0,ctlw=0; int g5wh=0,ctlwh=0;
  for(uint64_t k=lo;k<hi;k++){
    uint64_t v=k<<1; int S[64],y[64]; int s=__builtin_popcountll(v&((1ULL<<L)-1));
    for(int i=0;i<T;i++){ if(i) s += (int)((v>>(i+2*m))&1) - (int)((v>>(i-1))&1); S[i]=s; y[i]=(int)((v>>(i+m))&1); }
    words++;
    int need,I,W; int d=deficiency(T,L,S,y,og5,m+2,0,&need,&I,&W);
    int mn=99,mx=-1; for(int i=0;i<T;i++){if(S[i]<mn)mn=S[i]; if(S[i]>mx)mx=S[i];} int delta=L-(mx-mn);
    if(I>m+delta) thm++;
#ifdef PLANT
    need=need+1; if(need>0){ int r=mt_max(); d= need>r? need-r:0; }
#endif
    if(need<=0) continue;
    needpos++; needh[need<64?need:63]++;
    if(d>0){ g5f++; if(!g5wh){g5w=v;g5wh=1;} }
    else if(mt_max()==need) tight++;
    int n2,I2,W2; int d2=deficiency(T,L,S,y,octl,m+1,0,&n2,&I2,&W2);
    if(d2>0){ ctlf++; if(!ctlwh){ctlw=v;ctlwh=1;} }
  }
  FILE*f=fopen(argv[4],"w"); if(!f)return 4;
  fprintf(f,"m %d\nshard %d/%d\nwords %lld\nneed_pos %lld\ng5_fail %lld\nctl_fail %lld\nthm_viol %lld\ng5_exact %lld\n",m,sh,ns,words,needpos,g5f,ctlf,thm,tight);
  for(int q=0;q<64;q++) if(needh[q]) fprintf(f,"need_hist %d %lld\n",q,needh[q]);
  if(g5wh){fprintf(f,"g5_witness ");for(int j=0;j<N;j++)fputc('0'+(int)((g5w>>j)&1),f);fprintf(f,"\n");}
  if(ctlwh){fprintf(f,"ctl_witness ");for(int j=0;j<N;j++)fputc('0'+(int)((ctlw>>j)&1),f);fprintf(f,"\n");}
  fclose(f); return 0;}
